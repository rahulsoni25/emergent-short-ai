import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Ensure ffmpeg path is absolute and correctly set
let resolvedFfmpegPath = ffmpegPath;

// Fallback for Windows environment if ffmpegPath is missing or weirdly formatted
if (!resolvedFfmpegPath || (typeof resolvedFfmpegPath === 'string' && resolvedFfmpegPath.startsWith('\\ROOT'))) {
  const possiblePath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
  resolvedFfmpegPath = possiblePath;
}

if (resolvedFfmpegPath) {
  console.log('Using FFmpeg at:', resolvedFfmpegPath);
  ffmpeg.setFfmpegPath(resolvedFfmpegPath);
} else {
  console.error('FFmpeg path not found!');
}

async function downloadFile(url: string, dest: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429 && i < retries - 1) {
          console.log(`Rate limited on ${url}, retrying in ${Math.pow(2, i)}s...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      if (!response.body) throw new Error(`No body for ${url}`);
      
      // @ts-ignore
      const nodeStream = Readable.fromWeb(response.body);
      await pipeline(nodeStream, createWriteStream(dest));
      return; // Success
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1} for ${url} due to error: ${error}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export async function POST(request: Request) {
  // Use absolute paths to avoid resolution issues
  const root = process.cwd();
  const tmpDir = path.join(root, 'tmp-render');
  const publicDir = path.join(root, 'public', 'renders');
  
  try {
    const { imageUrls, audioBase64 } = await request.json();

    if (!imageUrls || !imageUrls.length) {
      return NextResponse.json({ error: 'Image URLs are required' }, { status: 400 });
    }

    // Ensure directories exist
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.mkdir(publicDir, { recursive: true });

    const sessionID = Date.now();
    
    // 1. Download images sequentially with a delay to be safe
    const scenePaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imgPath = path.join(tmpDir, `img_${sessionID}_${i}.jpg`);
      await downloadFile(imageUrls[i], imgPath);
      scenePaths.push(imgPath);
      // Wait 1s between downloads to avoid rate limiting
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 2. Handle audio if provided
    let audioPath = '';
    if (audioBase64) {
      audioPath = path.join(tmpDir, `audio_${sessionID}.wav`);
      await fs.writeFile(audioPath, Buffer.from(audioBase64, 'base64'));
    }

    const outputFileName = `short_${sessionID}.mp4`;
    const outputPath = path.join(publicDir, outputFileName);
    const ffmpegOutputPath = outputPath.replace(/\\/g, '/');

    // 3. Render video with transitions
    await new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Normalize paths for FFmpeg
      const normalizedScenePaths = scenePaths.map(p => p.replace(/\\/g, '/'));
      const normalizedAudioPath = audioPath.replace(/\\/g, '/');

      // Add each image input
      normalizedScenePaths.forEach((p) => {
        command = command.input(p).inputOptions(['-loop 1', '-t 4']); // 4s per image
      });

      if (normalizedAudioPath) {
        command = command.input(normalizedAudioPath);
      }

      const imageCount = normalizedScenePaths.length;
      
      // Complex filter for crossfades
      // Each image is 4s. Total duration = 4 * imageCount.
      // We want to crossfade for 0.5s.
      let filter = '';
      for (let i = 0; i < imageCount; i++) {
        // Scale and pad each input first
        filter += `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[v${i}];`;
      }

      // Chain xfades
      // xfade duration 0.5s, offset for each is (4 * (i+1)) - 0.5
      let lastOutput = 'v0';
      for (let i = 1; i < imageCount; i++) {
        const nextOutput = `vx${i}`;
        const offset = i * 3.5; // 4s - 0.5s overlap
        filter += `[${lastOutput}][v${i}]xfade=transition=fade:duration=0.5:offset=${offset}[${nextOutput}];`;
        lastOutput = nextOutput;
      }

      command
        .complexFilter(filter)
        .outputOptions([
          `-map [${lastOutput}]`,
          '-c:v libx264',
          '-preset ultrafast',
          '-tune stillimage',
          '-pix_fmt yuv420p',
          '-r 30',
          '-movflags +faststart'
        ]);

      if (normalizedAudioPath) {
        command.outputOptions([
          `-map ${imageCount}:a`,
          '-c:a aac',
          '-shortest'
        ]);
      }

      command
        .on('start', (cmd) => console.log('FFmpeg command:', cmd))
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        })
        .on('end', () => resolve(true))
        .save(ffmpegOutputPath);
    });

    // 4. Cleanup
    const cleanup = async () => {
      for (const p of scenePaths) await fs.unlink(p).catch(() => {});
      if (audioPath) await fs.unlink(audioPath).catch(() => {});
    };
    cleanup();

    return NextResponse.json({
      message: 'Video rendered successfully',
      videoUrl: `/renders/${outputFileName}`,
    });
  } catch (error: any) {
    console.error('Error in render route:', error);
    return NextResponse.json({ error: error.message || 'Failed to render video' }, { status: 500 });
  }
}
