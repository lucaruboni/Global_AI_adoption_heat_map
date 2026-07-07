import * as THREE from 'three';

/** Converts lat/lon (degrees) to a point on a sphere of radius r. (from MVP) */
export function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export interface TopoFeature {
  name: string;
  iso3: string | null;
  polys: number[][][][]; // [poly][ring][point][lon,lat]
}

interface TopoJson {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: {
    countries: {
      geometries: {
        type: 'Polygon' | 'MultiPolygon';
        arcs: number[][] | number[][][];
        properties: { name: string; iso3?: string };
      }[];
    };
  };
}

/** Decodes TopoJSON into flat lon/lat polygon rings. (from MVP) */
export function decodeTopo(topo: TopoJson): TopoFeature[] {
  const sc = topo.transform.scale;
  const tr = topo.transform.translate;
  const arcs = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map((p) => {
      x += p[0];
      y += p[1];
      return [x * sc[0] + tr[0], y * sc[1] + tr[1]] as [number, number];
    });
  });

  const ringOf = (arcIdxs: number[]): [number, number][] => {
    let ring: [number, number][] = [];
    arcIdxs.forEach((i) => {
      const pts = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
      ring = ring.length ? ring.concat(pts.slice(1)) : ring.concat(pts);
    });
    return ring;
  };

  return topo.objects.countries.geometries.map((g) => {
    let polys: number[][][][] = [];
    if (g.type === 'Polygon') {
      polys = [(g.arcs as number[][]).map(ringOf)];
    } else {
      polys = (g.arcs as number[][][]).map((poly) => poly.map(ringOf));
    }
    return { name: g.properties.name, iso3: g.properties.iso3 ?? null, polys };
  });
}
