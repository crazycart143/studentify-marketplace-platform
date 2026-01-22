import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'shs') {
      return NextResponse.json(SENIOR_HIGH_SCHOOLS);
    }

    // Default to Universities
    const res = await fetch("http://universities.hipolabs.com/search?country=Philippines", {
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error(`External API responded with status: ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("University API Fetch Error:", error);
    return NextResponse.json(FALLBACK_UNIVERSITIES);
  }
}

const SENIOR_HIGH_SCHOOLS = [
  { name: "Daniel R. Aguinaldo National High School", country: "Philippines", domains: [] },
  { name: "Philippine Science High School - Main Campus", country: "Philippines", domains: [] },
  { name: "Manila Science High School", country: "Philippines", domains: [] },
  { name: "Quezon City Science High School", country: "Philippines", domains: [] },
  { name: "Rizal High School", country: "Philippines", domains: [] },
  { name: "University of Santo Tomas Senior High School", country: "Philippines", domains: [] },
  { name: "Ateneo de Manila Senior High School", country: "Philippines", domains: [] },
  { name: "De La Salle University Senior High School", country: "Philippines", domains: [] },
  { name: "FEU High School", country: "Philippines", domains: [] },
  { name: "Mapúa University Senior High School", country: "Philippines", domains: [] },
  { name: "Davao City National High School", country: "Philippines", domains: [] },
  { name: "Cebu City National Science High School", country: "Philippines", domains: [] },
  { name: "Makati Science High School", country: "Philippines", domains: [] },
  { name: "Pasig City Science High School", country: "Philippines", domains: [] },
  { name: "Caloocan City Science High School", country: "Philippines", domains: [] },
];

const FALLBACK_UNIVERSITIES = [
  { name: "University of the Philippines Diliman", country: "Philippines", domains: ["upd.edu.ph"] },
  { name: "Ateneo de Manila University", country: "Philippines", domains: ["ateneo.edu"] },
  { name: "De La Salle University", country: "Philippines", domains: ["dlsu.edu.ph"] },
  { name: "University of Santo Tomas", country: "Philippines", domains: ["ust.edu.ph"] },
  { name: "Polytechnic University of the Philippines", country: "Philippines", domains: ["pup.edu.ph"] },
  { name: "Far Eastern University", country: "Philippines", domains: ["feu.edu.ph"] },
  { name: "University of the Philippines Los Banos", country: "Philippines", domains: ["uplb.edu.ph"] },
  { name: "Mapúa University", country: "Philippines", domains: ["mapua.edu.ph"] },
  { name: "Adamson University", country: "Philippines", domains: ["adamson.edu.ph"] },
  { name: "University of San Carlos", country: "Philippines", domains: ["usc.edu.ph"] },
  { name: "Silliman University", country: "Philippines", domains: ["su.edu.ph"] },
  { name: "Mindanao State University", country: "Philippines", domains: ["msumain.edu.ph"] },
  { name: "Ateneo de Davao University", country: "Philippines", domains: ["addu.edu.ph"] },
  { name: "Xavier University", country: "Philippines", domains: ["xu.edu.ph"] },
  { name: "Saint Louis University", country: "Philippines", domains: ["slu.edu.ph"] },
  { name: "University of the East", country: "Philippines", domains: ["ue.edu.ph"] },
  { name: "Lyceum of the Philippines University", country: "Philippines", domains: ["lpu.edu.ph"] },
  { name: "Centro Escolar University", country: "Philippines", domains: ["ceu.edu.ph"] },
  { name: "Arellano University", country: "Philippines", domains: ["arellano.edu.ph"] },
  { name: "Philippine Women's College of Davao", country: "Philippines", domains: [] }
];
