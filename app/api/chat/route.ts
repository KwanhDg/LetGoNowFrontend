import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Bạn là trợ lý ảo của LetGoNow - một nền tảng đặt du thuyền và vé máy bay.
Hãy trả lời các câu hỏi của khách hàng một cách thân thiện và chuyên nghiệp.
Tập trung vào các chủ đề:
- Đặt du thuyền
- Đặt vé máy bay
- Thanh toán
- Chính sách hủy/hoàn tiền
- Dịch vụ bổ sung
- Hỗ trợ khách hàng

Nếu không biết câu trả lời, hãy thừa nhận và đề nghị khách hàng liên hệ với bộ phận hỗ trợ.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
} 