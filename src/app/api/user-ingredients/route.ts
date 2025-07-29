import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM user_ingredients ORDER BY updated_at DESC');
    const ingredients = stmt.all();
    
    const parsedIngredients = ingredients.map((ingredient: any) => ({
      ...JSON.parse(ingredient.data),
      _lastUpdated: ingredient.updated_at
    }));
    
    return NextResponse.json({ userIngredients: parsedIngredients });
  } catch (error) {
    console.error('Error fetching user ingredients:', error);
    return NextResponse.json({ error: 'Failed to fetch user ingredients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...ingredientData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_ingredients (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(ingredientData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving user ingredient:', error);
    return NextResponse.json({ error: 'Failed to save user ingredient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Ingredient ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM user_ingredients WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user ingredient:', error);
    return NextResponse.json({ error: 'Failed to delete user ingredient' }, { status: 500 });
  }
}