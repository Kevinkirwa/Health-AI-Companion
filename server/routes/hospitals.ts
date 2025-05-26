import { Router } from 'express';
import { db } from '../db';
import { hospitals } from '../models/hospital';
import { eq, ilike, or } from 'drizzle-orm';

const router = Router();

// Search hospitals
router.get('/search', async (req, res) => {
  try {
    const { query, county, level } = req.query;
    
    let whereClause = undefined;
    
    if (query) {
      whereClause = or(
        ilike(hospitals.name, `%${query}%`),
        ilike(hospitals.code, `%${query}%`)
      );
    }
    
    if (county) {
      whereClause = whereClause 
        ? or(whereClause, eq(hospitals.location.cast('jsonb->county'), county as string))
        : eq(hospitals.location.cast('jsonb->county'), county as string);
    }
    
    if (level) {
      whereClause = whereClause
        ? or(whereClause, eq(hospitals.level, level as string))
        : eq(hospitals.level, level as string);
    }
    
    const results = await db
      .select()
      .from(hospitals)
      .where(whereClause)
      .limit(50);
    
    res.json(results);
  } catch (error) {
    console.error('Error searching hospitals:', error);
    res.status(500).json({ error: 'Failed to search hospitals' });
  }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id))
      .limit(1);
    
    if (!hospital.length) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json(hospital[0]);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: 'Failed to fetch hospital' });
  }
});

export default router; 