import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/stats
router.get('/', (req: Request, res: Response) => {
  const statsData = [
    { title: 'Toplam Gelir / Totale Omzet', value: '€124,500', change: '+12.5%', isPositive: true },
    { title: 'Yeni Müşteriler / Nieuwe Klanten', value: '1,240', change: '+8.2%', isPositive: true },
    { title: 'Aktif Abonelikler / Actieve Abonnements', value: '850', change: '-2.1%', isPositive: false },
  ];

  res.json(statsData);
});

export default router;