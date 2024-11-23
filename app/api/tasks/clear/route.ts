import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST() {
  try {
    // データベース内のすべてのページを取得
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    });

    // すべてのページを削除
    await Promise.all(
      response.results.map(page => 
        notion.pages.update({
          page_id: page.id,
          archived: true, // Notionではアーカイブが削除と同等
        })
      )
    );

    return NextResponse.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Failed to clear database:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
} 