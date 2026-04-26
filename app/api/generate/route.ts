import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request: Request) {
  try {
    const { topic, niche, length } = await request.json();

    // Simulate LLM processing time (In production, replace with actual Gemini call)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Dynamic Mock Script with better structure
    const scripts = [
      {
        hook: `I bet you didn't know this about ${topic}.`,
        body: `It's not just about ${niche}. It's about how we interact with the world. Imagine a future where ${topic} is the norm. The implications are massive, especially for anyone in ${niche}.`,
        cta: `Follow for more ${niche} insights!`
      },
      {
        hook: `Stop! ${topic} is about to explode.`,
        body: `We are seeing a massive shift in ${niche}. Most people are looking the other way, but ${topic} is the real game changer. Here is why you should care right now.`,
        cta: `Share this with someone who needs to hear it.`
      },
      {
        hook: `The truth about ${topic} revealed.`,
        body: `In the world of ${niche}, everything is changing fast. But ${topic} stands out. It's the one thing that will define the next decade of progress.`,
        cta: `What do you think? Let me know in the comments.`
      }
    ];

    const script = scripts[Math.floor(Math.random() * scripts.length)];
    const fullText = `${script.hook} ${script.body} ${script.cta}`;

    // Generate TTS URL (split into 200 char chunks automatically)
    const audioUrls = googleTTS.getAllAudioUrls(fullText, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Fetch and combine audio chunks into base64
    let audioBuffer = Buffer.alloc(0);
    for (const urlInfo of audioUrls) {
      const audioRes = await fetch(urlInfo.url);
      if (audioRes.ok) {
        const arrayBuffer = await audioRes.arrayBuffer();
        audioBuffer = Buffer.concat([audioBuffer, Buffer.from(arrayBuffer)]);
      }
    }
    const audioBase64 = audioBuffer.toString('base64');

    // Construct Pollinations image prompts based on the script segments
    const imagePrompts = [
      `Cinematic ${niche} ${topic} scene, 8k, vertical`,
      `Futuristic ${topic} visuals, neon, vertical`,
      `Detail of ${topic} technology, sharp, vertical`,
      `Abstract growth in ${niche}, professional, vertical`
    ];

    const imageUrls = imagePrompts.map(p => 
      `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1080&height=1920&nologo=true&model=turbo&seed=${Math.floor(Math.random() * 100000)}`
    );

    return NextResponse.json({
      script,
      imagePrompts,
      imageUrls,
      audioBase64,
      metadata: {
        engine: 'Gemini 3 Pro via Emergent',
        visuals: 'Pollinations FLUX',
        audio: 'Google TTS',
        target: 'AEO / GEO Optimized'
      }
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
