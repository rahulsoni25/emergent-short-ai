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

    async function generateVoiceboxAudio(text: string) {
      const vbUrl = 'http://localhost:17493';
      try {
        const health = await fetch(`${vbUrl}/health`, { signal: AbortSignal.timeout(2000) });
        if (!health.ok) return null;

        let profileId = null;
        const profilesRes = await fetch(`${vbUrl}/profiles`);
        const profiles = await profilesRes.json();
        const existing = profiles.find((p: any) => p.name === 'ShortsVoice');
        
        if (existing) {
          profileId = existing.id;
        } else {
          const createRes = await fetch(`${vbUrl}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'ShortsVoice', voice_type: 'preset', preset_engine: 'kokoro', preset_voice_id: 'af_nova' })
          });
          const newProfile = await createRes.json();
          profileId = newProfile.id;
        }

        if (!profileId) return null;

        const audioRes = await fetch(`${vbUrl}/generate/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, text: text, engine: 'kokoro' })
        });

        if (!audioRes.ok) return null;
        const arrayBuffer = await audioRes.arrayBuffer();
        if (arrayBuffer.byteLength < 1000) return null; // Likely JSON error
        
        return Buffer.from(arrayBuffer).toString('base64');
      } catch (error) {
        console.log('Voicebox unavailable or error, falling back to Google TTS...');
        return null;
      }
    }

    let audioBase64 = await generateVoiceboxAudio(fullText);
    let audioSource = 'Voicebox (Kokoro)';

    if (!audioBase64) {
      // Fallback to Google TTS
      const audioUrls = googleTTS.getAllAudioUrls(fullText, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });

      let audioBuffer = Buffer.alloc(0);
      for (const urlInfo of audioUrls) {
        const audioRes = await fetch(urlInfo.url);
        if (audioRes.ok) {
          const arrayBuffer = await audioRes.arrayBuffer();
          audioBuffer = Buffer.concat([audioBuffer, Buffer.from(arrayBuffer)]);
        }
      }
      audioBase64 = audioBuffer.toString('base64');
      audioSource = 'Google TTS (Fallback)';
    }

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
        audio: audioSource,
        target: 'AEO / GEO Optimized'
      }
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
