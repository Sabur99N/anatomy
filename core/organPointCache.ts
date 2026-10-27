import { generators, Point } from '../data/generators';
import { ModelSampler } from './ModelSampler';
import { OrganData } from '../types';

const cache = new Map<string, Point[]>();

export async function fetchOrganPoints(organ: OrganData): Promise<Point[]> {
  const hit = cache.get(organ.id);
  if (hit?.length) return hit;

  let points: Point[] = [];
  if (organ.modelPath) {
    points = await ModelSampler.sample(organ.modelPath, organ.particleCount);
  }
  if (!points.length) {
    const gen = generators[organ.id as keyof typeof generators];
    if (gen) points = gen(organ.particleCount);
  }
  if (points.length) cache.set(organ.id, points);
  return points;
}

export function fetchOrganPointsSync(organ: OrganData): Point[] {
  const gen = generators[organ.id as keyof typeof generators];
  return gen ? gen(organ.particleCount) : [];
}

export function preloadOrgans(organs: OrganData[]) {
  organs.forEach((o, i) => setTimeout(() => fetchOrganPoints(o), 1000 + i * 500));
}
