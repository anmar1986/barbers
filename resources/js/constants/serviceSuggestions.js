// Service suggestions for different business types

export const barberServices = [
  // ✂️ Haircuts
  "Men's Haircut",
  "Women's Haircut",
  "Kids Haircut",
  "Buzz Cut",
  "Fade Haircut",
  "Taper Fade",
  "Skin Fade",
  "Crew Cut",
  "Flat Top",
  "Undercut",
  "Scissor Cut",
  "Layered Cut",
  "Trim & Shape Up",
  "Razor Cut",
  "Custom Design Cut",

  // 🧔 Beard & Shaving
  "Beard Trim",
  "Beard Sculpting",
  "Beard Line-Up",
  "Hot Towel Shave",
  "Traditional Shave",
  "Head Shave",
  "Face Shave",
  "Goatee Trim",

  // 💆 Treatments
  "Hair Wash & Conditioning",
  "Scalp Massage",
  "Deep Conditioning Treatment",
  "Dandruff Treatment",
  "Hair Coloring",
  "Grey Coverage",
  "Highlights",
  "Hair Straightening",
  "Keratin Treatment",
  "Hair Relaxer",

  // 🪮 Styling
  "Blow Dry",
  "Hair Styling",
  "Pomade Styling",
  "Wax Styling",
  "Event Styling",
  "Wedding Groom Package",

  // 👃 Facial & Grooming
  "Facial Cleanse",
  "Black Mask Treatment",
  "Nose Waxing",
  "Eyebrow Trim",
  "Ear Wax Removal",
  "Steam Facial",

  // 💅 Add-ons & Packages
  "Full Grooming Package",
  "Haircut & Beard Combo",
  "Haircut + Facial Package",
  "VIP Grooming Session",
  "Express Service",
  "Student Discount Haircut",
];

export const nailStudioServices = [
  // 💅 Manicures
  "Basic Manicure",
  "Gel Manicure",
  "Acrylic Nails",
  "Dip Powder Manicure",
  "French Manicure",
  "Gel Polish",
  "Nail Art",
  "Nail Design",
  "Chrome Nails",
  "Ombre Nails",
  "Marble Nails",
  "3D Nail Art",

  // 🦶 Pedicures
  "Basic Pedicure",
  "Gel Pedicure",
  "Spa Pedicure",
  "Deluxe Pedicure",
  "French Pedicure",
  "Medical Pedicure",
  "Paraffin Pedicure",

  // 🔧 Nail Care
  "Nail Extension",
  "Nail Removal",
  "Nail Repair",
  "Cuticle Treatment",
  "Nail Strengthening",
  "Nail Fill",
  "Nail Shape & Buff",

  // 💆 Add-ons & Treatments
  "Hand Massage",
  "Foot Massage",
  "Callus Removal",
  "Paraffin Wax Treatment",
  "Hot Stone Massage",

  // 📦 Packages
  "Mani-Pedi Combo",
  "Wedding Nail Package",
  "Bridal Nails",
  "Express Mani-Pedi",
  "Deluxe Spa Package",
];

export const hairSalonServices = [
  // ✂️ Haircuts
  "Women's Haircut",
  "Men's Haircut",
  "Kids Haircut",
  "Bang Trim",
  "Layered Cut",
  "Bob Haircut",
  "Pixie Cut",
  "Long Hair Cut",
  "Razor Cut",
  "Scissor Cut",

  // 🎨 Coloring
  "Full Hair Color",
  "Root Touch Up",
  "Highlights",
  "Lowlights",
  "Balayage",
  "Ombre",
  "Color Correction",
  "Fashion Colors",
  "Grey Coverage",
  "Gloss Treatment",
  "Toner Application",

  // 💇 Styling
  "Blow Dry",
  "Blowout",
  "Updo",
  "Formal Styling",
  "Bridal Hair",
  "Event Styling",
  "Curling",
  "Straightening",
  "Beach Waves",

  // 💆 Treatments
  "Deep Conditioning",
  "Keratin Treatment",
  "Brazilian Blowout",
  "Hair Botox",
  "Olaplex Treatment",
  "Scalp Treatment",
  "Hot Oil Treatment",
  "Protein Treatment",
  "Hair Mask",

  // 🦱 Texture Services
  "Perming",
  "Relaxer",
  "Japanese Straightening",
  "Volume Perm",

  // 👰 Special Events
  "Bridal Package",
  "Prom Styling",
  "Photoshoot Styling",
  "Makeup & Hair Combo",

  // ➕ Extensions & Add-ons
  "Hair Extensions",
  "Tape-in Extensions",
  "Clip-in Extensions",
  "Consultation",
];

export const massageServices = [
  // 💆 Massage Types
  "Swedish Massage",
  "Deep Tissue Massage",
  "Hot Stone Massage",
  "Aromatherapy Massage",
  "Thai Massage",
  "Sports Massage",
  "Prenatal Massage",
  "Couples Massage",
  "Reflexology",
  "Shiatsu Massage",
  "Trigger Point Therapy",
  "Lymphatic Drainage",
  "Myofascial Release",

  // 🎯 Targeted Treatments
  "Back Massage",
  "Neck & Shoulder Massage",
  "Foot Massage",
  "Hand & Arm Massage",
  "Scalp Massage",
  "Face Massage",
  "Full Body Massage",

  // 🌿 Specialty Services
  "CBD Massage",
  "Cupping Therapy",
  "Bamboo Massage",
  "Lomi Lomi Massage",
  "Indian Head Massage",
  "Chair Massage",
  "Ashiatsu Massage",

  // 🧖 Spa Treatments
  "Body Scrub",
  "Body Wrap",
  "Sauna Session",
  "Steam Room",
  "Hydrotherapy",

  // 📦 Packages
  "Spa Day Package",
  "Relaxation Package",
  "Detox Package",
  "Wellness Package",
  "Monthly Membership",
  "60-Minute Session",
  "90-Minute Session",
  "120-Minute Session",
];

// Get suggestions based on business type
export const getServiceSuggestions = (businessType) => {
  switch (businessType) {
    case 'barber':
      return barberServices;
    case 'nail_studio':
      return nailStudioServices;
    case 'hair_salon':
      return hairSalonServices;
    case 'massage':
      return massageServices;
    default:
      return [];
  }
};

// Filter suggestions based on input
export const filterSuggestions = (suggestions, input) => {
  if (!input || input.trim() === '') return suggestions;

  const lowercaseInput = input.toLowerCase().trim();
  return suggestions.filter(service =>
    service.toLowerCase().includes(lowercaseInput)
  );
};
