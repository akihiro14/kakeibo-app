import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const app = express();

// フロントエンド開発サーバーからのリクエストを許可
app.use(cors({ origin: 'http://localhost:5173' }));

// Base64画像を含むため上限を20MBに設定
app.use(express.json({ limit: '20mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// レシート画像をClaude APIで解析するエンドポイント
app.post('/api/parse-receipt', async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: '画像データが不正です' });
    }

    const today = new Date().toISOString().slice(0, 10);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `このレシート画像を解析して、以下のJSON形式のみで返してください。説明文は不要です。
{
  "date": "YYYY-MM-DD（不明な場合は今日の日付 ${today}）",
  "store": "店名（不明な場合は「不明」）",
  "items": [
    {
      "name": "商品名",
      "price": 金額（半角数字のみ）,
      "category": "食費 または 日用品 または 外食 または 交通費 または 娯楽 または その他"
    }
  ],
  "total": 合計金額（半角数字のみ）
}`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].text;

    // レスポンステキストからJSONブロックを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'レシートの解析結果を取得できませんでした' });
    }

    const data = JSON.parse(jsonMatch[0]);
    res.json(data);
  } catch (error) {
    console.error('Claude API エラー:', error.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`バックエンドサーバー起動: http://localhost:${PORT}`);
});
