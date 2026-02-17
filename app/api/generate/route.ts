import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, style = 'modern' } = await request.json();

    // 1. Генерируем структуру и контент сайта
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Ты - профессиональный веб-дизайнер. Создавай современные, красивые сайты.
Для генерации используй:
- HTML5 семантическую разметку
- Tailwind CSS для стилей
- Адаптивный дизайн (mobile-first)
- Красивые градиенты и анимации
- Font Awesome иконки (CDN)
- Google Fonts

Ответь JSON объектом с полями:
- title: название сайта
- description: описание
- sections: массив секций (hero, features, about, contact, etc.)
- colorScheme: {primary, secondary, accent}
- imagePrompts: массив промптов для генерации изображений
- html: полный HTML код страницы`
        },
        {
          role: "user",
          content: `Создай сайт: ${prompt}. Стиль: ${style}. Включи красивые изображения и современный дизайн.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const siteData = JSON.parse(completion.choices[0].message.content || '{}');

    // 2. Генерируем изображения через DALL-E
    const images = [];
    if (siteData.imagePrompts && Array.isArray(siteData.imagePrompts)) {
      for (const imagePrompt of siteData.imagePrompts.slice(0, 3)) {
        const image = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });
        images.push(image.data[0].url);
      }
    }

    // 3. Добавляем изображения в HTML
    let htmlWithImages = siteData.html || '';
    images.forEach((url, index) => {
      htmlWithImages = htmlWithImages.replace(
        new RegExp(`src="placeholder-${index + 1}"`, 'g'),
        `src="${url}"`
      );
    });

    return NextResponse.json({
      success: true,
      site: {
        ...siteData,
        images,
        html: htmlWithImages
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate site' },
      { status: 500 }
    );
  }
}
