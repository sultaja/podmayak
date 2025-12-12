
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { AppContent, DbStyle, DbRoom, DbColor, DbFlooring, DbFurniture, DbPreset, RenovatorStyle, RoomType, FlooringType } from "../types";

// --- Seed Data (Initial Data to Populate DB) ---

const INITIAL_STYLES: DbStyle[] = [
  { id: 'modern', label: 'Müasir', value: RenovatorStyle.Modern },
  { id: 'industrial', label: 'Loft / Sənaye', value: RenovatorStyle.Industrial },
  { id: 'bohemian', label: 'Bohem', value: RenovatorStyle.Bohemian },
  { id: 'classic', label: 'Klassik', value: RenovatorStyle.Classic },
  { id: 'minimalist', label: 'Minimalist', value: RenovatorStyle.Minimalist },
  { id: 'scandinavian', label: 'Skandinaviya', value: RenovatorStyle.Scandinavian },
  { id: 'luxury', label: 'Lüks', value: RenovatorStyle.Luxury },
  { id: 'neoclassic', label: 'Neoklassik', value: RenovatorStyle.Neoclassic },
  { id: 'art_deco', label: 'Art Deco', value: RenovatorStyle.ArtDeco },
  { id: 'mediterranean', label: 'Aralıq Dənizi', value: RenovatorStyle.Mediterranean },
  { id: 'japandi', label: 'Japandi / Zen', value: RenovatorStyle.Japandi },
  { id: 'cyberpunk', label: 'Kiberpank', value: RenovatorStyle.Cyberpunk },
  { id: 'farmhouse', label: 'Kənd Evi', value: RenovatorStyle.Farmhouse },
  { id: 'baroque', label: 'Barokko', value: RenovatorStyle.Baroque },
  { id: 'steampunk', label: 'Stimpank', value: RenovatorStyle.Steampunk },
  { id: 'gothic', label: 'Qotik', value: RenovatorStyle.Gothic },
  { id: 'coastal', label: 'Sahil Evi', value: RenovatorStyle.Coastal },
  { id: 'rustic', label: 'Rustik', value: RenovatorStyle.Rustic },
];

const INITIAL_ROOMS: DbRoom[] = [
  { id: 'living_room', label: 'Qonaq Otağı', value: RoomType.LivingRoom },
  { id: 'bedroom', label: 'Yataq Otağı', value: RoomType.Bedroom },
  { id: 'kitchen', label: 'Mətbəx', value: RoomType.Kitchen },
  { id: 'bathroom', label: 'Hamam', value: RoomType.Bathroom },
  { id: 'hallway', label: 'Dəhliz', value: RoomType.Hallway },
  { id: 'office', label: 'Ofis', value: RoomType.Office },
  { id: 'balcony', label: 'Eyvan', value: RoomType.Balcony },
  { id: 'dining_room', label: 'Yemək Otağı', value: RoomType.DiningRoom },
  { id: 'gaming_room', label: 'Oyun Otağı', value: RoomType.GamingRoom },
  { id: 'home_gym', label: 'İdman Zalı', value: RoomType.HomeGym },
  { id: 'library', label: 'Kitabxana', value: RoomType.Library },
  { id: 'home_theater', label: 'Kino Zalı', value: RoomType.HomeTheater },
  { id: 'attic', label: 'Mansard', value: RoomType.Attic },
  { id: 'basement', label: 'Zirzəmi', value: RoomType.Basement },
  { id: 'walk_in_closet', label: 'Qarderob Otağı', value: RoomType.WalkInCloset },
  { id: 'other', label: 'Digər', value: RoomType.Other },
];

const INITIAL_FLOORING: DbFlooring[] = [
  { id: 'hardwood', label: 'Parket', value: FlooringType.Hardwood, colorClass: 'bg-[#8B4513]' },
  { id: 'laminate', label: 'Laminat', value: FlooringType.Laminate, colorClass: 'bg-[#D2B48C]' },
  { id: 'tile', label: 'Kafel', value: FlooringType.Tile, colorClass: 'bg-[#E0E0E0]' },
  { id: 'marble', label: 'Mərmər', value: FlooringType.Marble, colorClass: 'bg-[#F5F5F5]' },
  { id: 'carpet', label: 'Kavrolit', value: FlooringType.Carpet, colorClass: 'bg-[#A0522D]' },
  { id: 'concrete', label: 'Beton', value: FlooringType.Concrete, colorClass: 'bg-[#708090]' },
  { id: 'epoxy', label: 'Epoksi', value: FlooringType.Epoxy, colorClass: 'bg-[#374151]' },
  { id: 'stone', label: 'Daş', value: FlooringType.Stone, colorClass: 'bg-[#57534e]' },
];

const INITIAL_COLORS: DbColor[] = [
  { id: 'beige', name: 'Sakit Bej', value: 'Beige', bgClass: 'bg-[#E5D0B1]' },
  { id: 'grey', name: 'Boz', value: 'Grey', bgClass: 'bg-[#9CA3AF]' },
  { id: 'white', name: 'Ağ', value: 'White', bgClass: 'bg-white' },
  { id: 'black', name: 'Qara', value: 'Black', bgClass: 'bg-black' },
  { id: 'deep_blue', name: 'Dərin Okean', value: 'Deep Blue', bgClass: 'bg-[#0F4C75]' },
  { id: 'gold', name: 'Qızılı', value: 'Gold', bgClass: 'bg-[#FFD700]' },
  { id: 'terracotta', name: 'Terrakota', value: 'Terracotta', bgClass: 'bg-[#D35400]' },
  { id: 'sage_green', name: 'Adaçayı', value: 'Sage Green', bgClass: 'bg-[#8FBC8F]' },
  { id: 'dark_brown', name: 'Şokolad', value: 'Dark Brown', bgClass: 'bg-[#3E2723]' },
  { id: 'pastel_pink', name: 'Pastel Çəhrayı', value: 'Pastel Pink', bgClass: 'bg-[#FFD1DC]' },
  { id: 'navy', name: 'Göy', value: 'Navy', bgClass: 'bg-[#000080]' },
  { id: 'emerald', name: 'Zümrüd', value: 'Emerald', bgClass: 'bg-[#50C878]' },
  { id: 'lavender', name: 'Lavanda', value: 'Lavender', bgClass: 'bg-[#E6E6FA]' },
  { id: 'mint', name: 'Nanə', value: 'Mint', bgClass: 'bg-[#98FF98]' },
  { id: 'crimson', name: 'Tünd Qırmızı', value: 'Crimson', bgClass: 'bg-[#DC143C]' },
  { id: 'lemon', name: 'Limon', value: 'Lemon', bgClass: 'bg-[#FFF700]' },
  { id: 'bronze', name: 'Bürünc', value: 'Bronze', bgClass: 'bg-[#CD7F32]' },
  { id: 'silver', name: 'Gümüşü', value: 'Silver', bgClass: 'bg-[#C0C0C0]' },
  { id: 'olive', name: 'Zeytun', value: 'Olive', bgClass: 'bg-[#808000]' },
  { id: 'neon_blue', name: 'Neon Mavi', value: 'Neon Blue', bgClass: 'bg-[#1F51FF]' },
  { id: 'neon_pink', name: 'Neon Çəhrayı', value: 'Neon Pink', bgClass: 'bg-[#FF10F0]' },
  { id: 'cream', name: 'Krem', value: 'Cream', bgClass: 'bg-[#FFFDD0]' },
  { id: 'charcoal', name: 'Kömür', value: 'Charcoal', bgClass: 'bg-[#36454F]' },
  { id: 'copper', name: 'Mis', value: 'Copper', bgClass: 'bg-[#B87333]' },
];

const INITIAL_PRESETS: DbPreset[] = [
  { id: 'modern_baku', name: 'Müasir Bakı', style: RenovatorStyle.Modern, colors: ['Beige', 'Grey', 'Navy'], flooring: FlooringType.Laminate, icon: 'Briefcase' },
  { id: 'scandinavian', name: 'Skandinaviya', style: RenovatorStyle.Scandinavian, colors: ['White', 'Sage Green', 'Beige'], flooring: FlooringType.Hardwood, icon: 'Coffee' },
  { id: 'loft', name: 'Loft', style: RenovatorStyle.Industrial, colors: ['Black', 'Grey', 'Terracotta'], flooring: FlooringType.Concrete, icon: 'Box' },
  { id: 'classic_luxury', name: 'Klassik Lüks', style: RenovatorStyle.Classic, colors: ['Gold', 'Cream', 'White'], flooring: FlooringType.Marble, icon: 'Sparkles' },
  { id: 'boho', name: 'Bohem', style: RenovatorStyle.Bohemian, colors: ['Terracotta', 'Sage Green', 'Beige'], flooring: FlooringType.Carpet, icon: 'Palmtree' },
  { id: 'cyberpunk', name: 'Kiberpank', style: RenovatorStyle.Cyberpunk, colors: ['Neon Blue', 'Neon Pink', 'Black'], flooring: FlooringType.Epoxy, icon: 'Zap' },
  { id: 'zen', name: 'Zen', style: RenovatorStyle.Japandi, colors: ['Beige', 'White', 'Stone'], flooring: FlooringType.Stone, icon: 'Leaf' },
];

// Combine Furniture
const INITIAL_FURNITURE: DbFurniture[] = [
  // Common
  { id: 'Sofa', label: 'Divan', icon: 'Sofa', roomTypes: ['all'] },
  { id: 'Table', label: 'Masa', icon: 'Layout', roomTypes: ['all'] },
  { id: 'Chair', label: 'Stul', icon: 'Armchair', roomTypes: ['all'] },
  { id: 'Lighting', label: 'İşıqlandırma', icon: 'Lamp', roomTypes: ['all'] },
  { id: 'Rug', label: 'Xalça', icon: 'ScanLine', roomTypes: ['all'] },
  { id: 'Plant', label: 'Bitki', icon: 'Palmtree', roomTypes: ['all'] },
  { id: 'Curtains', label: 'Pərdə', icon: 'Grid', roomTypes: ['all'] },
  // Living Room
  { id: 'TV Unit', label: 'TV Stendi', icon: 'Tv', roomTypes: [RoomType.LivingRoom] },
  { id: 'Bookshelf', label: 'Kitab Rəfi', icon: 'FileText', roomTypes: [RoomType.LivingRoom, RoomType.Office, RoomType.Library] },
  { id: 'Fireplace', label: 'Kamin', icon: 'Sparkles', roomTypes: [RoomType.LivingRoom] },
  // Bedroom
  { id: 'Double Bed', label: 'İki nəfərlik Çarpayı', icon: 'Layout', roomTypes: [RoomType.Bedroom] },
  { id: 'Wardrobe', label: 'Qarderob', icon: 'Box', roomTypes: [RoomType.Bedroom] },
  { id: 'Nightstand', label: 'Tumba', icon: 'Box', roomTypes: [RoomType.Bedroom] },
  { id: 'Dressing Table', label: 'Makiyaj Masası', icon: 'Layout', roomTypes: [RoomType.Bedroom] },
  { id: 'Mirror', label: 'Güzgü', icon: 'ScanLine', roomTypes: [RoomType.Bedroom, RoomType.Bathroom, RoomType.Hallway, RoomType.WalkInCloset] },
  // Gaming
  { id: 'Gaming Desk', label: 'Oyun Masası', icon: 'Monitor', roomTypes: [RoomType.GamingRoom] },
  { id: 'Gaming Chair', label: 'Oyun Kreslosu', icon: 'Armchair', roomTypes: [RoomType.GamingRoom] },
  { id: 'RGB Lights', label: 'RGB İşıqlar', icon: 'Zap', roomTypes: [RoomType.GamingRoom] },
  { id: 'Posters', label: 'Posterlər', icon: 'ImageIcon', roomTypes: [RoomType.GamingRoom] },
  { id: 'Shelves', label: 'Rəflər', icon: 'Grid', roomTypes: [RoomType.GamingRoom, RoomType.Basement, RoomType.WalkInCloset] },
  { id: 'Bean Bag', label: 'Puf', icon: 'Sofa', roomTypes: [RoomType.GamingRoom] },
  // Gym
  { id: 'Treadmill', label: 'Qaçış Zolağı', icon: 'Dumbbell', roomTypes: [RoomType.HomeGym] },
  { id: 'Weights', label: 'Çəki Daşları', icon: 'Dumbbell', roomTypes: [RoomType.HomeGym] },
  { id: 'Yoga Mat', label: 'Yoqa Matı', icon: 'ScanLine', roomTypes: [RoomType.HomeGym] },
  { id: 'Mirror Wall', label: 'Güzgü Divar', icon: 'ScanLine', roomTypes: [RoomType.HomeGym] },
  { id: 'Bench', label: 'Skamya', icon: 'Layout', roomTypes: [RoomType.HomeGym] },
  // Theater
  { id: 'Projector', label: 'Proyektor', icon: 'Film', roomTypes: [RoomType.HomeTheater] },
  { id: 'Recliner Seats', label: 'Kino Kresloları', icon: 'Armchair', roomTypes: [RoomType.HomeTheater] },
  { id: 'Sound System', label: 'Səs Sistemi', icon: 'Zap', roomTypes: [RoomType.HomeTheater] },
  { id: 'Popcorn Machine', label: 'Popkorn', icon: 'Box', roomTypes: [RoomType.HomeTheater] },
  { id: 'Acoustic Panels', label: 'Akustik Panel', icon: 'Grid', roomTypes: [RoomType.HomeTheater] },
  // Library
  { id: 'Large Bookshelf', label: 'Böyük Kitabxana', icon: 'Book', roomTypes: [RoomType.Library] },
  { id: 'Reading Chair', label: 'Oxu Kreslosu', icon: 'Armchair', roomTypes: [RoomType.Library] },
  { id: 'Ladder', label: 'Nərdivan', icon: 'Grid', roomTypes: [RoomType.Library] },
  { id: 'Desk', label: 'Yazı Masası', icon: 'Layout', roomTypes: [RoomType.Library] },
  { id: 'Table Lamp', label: 'Masa Lampası', icon: 'Lamp', roomTypes: [RoomType.Library] },
  // Kitchen
  { id: 'Kitchen Island', label: 'Mətbəx Adası', icon: 'Layout', roomTypes: [RoomType.Kitchen] },
  { id: 'Dining Table', label: 'Yemək Masası', icon: 'Layout', roomTypes: [RoomType.Kitchen, RoomType.DiningRoom] },
  { id: 'Bar Stools', label: 'Bar Stulları', icon: 'Armchair', roomTypes: [RoomType.Kitchen] },
  { id: 'Cabinets', label: 'Dolablar', icon: 'Box', roomTypes: [RoomType.Kitchen] },
  { id: 'Fridge', label: 'Soyuducu', icon: 'Box', roomTypes: [RoomType.Kitchen] },
  // Bathroom
  { id: 'Vanity Unit', label: 'Əl-üz Yuyan', icon: 'Box', roomTypes: [RoomType.Bathroom] },
  { id: 'Bathtub', label: 'Vanna', icon: 'Box', roomTypes: [RoomType.Bathroom] },
  { id: 'Shower Cabin', label: 'Duş Kabini', icon: 'Box', roomTypes: [RoomType.Bathroom] },
  // Dining
  { id: 'Large Dining Table', label: 'Böyük Masa', icon: 'Layout', roomTypes: [RoomType.DiningRoom] },
  { id: 'Chairs', label: 'Stullar', icon: 'Armchair', roomTypes: [RoomType.DiningRoom] },
  { id: 'Chandelier', label: 'Çılçıraq', icon: 'Sparkles', roomTypes: [RoomType.DiningRoom] },
  { id: 'Sideboard', label: 'Servant', icon: 'Box', roomTypes: [RoomType.DiningRoom] },
  // Office
  { id: 'Office Desk', label: 'Yazı Masası', icon: 'Layout', roomTypes: [RoomType.Office] },
  { id: 'Ergonomic Chair', label: 'Ofis Kreslosu', icon: 'Armchair', roomTypes: [RoomType.Office] },
  // Closet
  { id: 'Shelving Unit', label: 'Rəf Sistemi', icon: 'Grid', roomTypes: [RoomType.WalkInCloset] },
  { id: 'Island', label: 'Ada (Şkaf)', icon: 'Box', roomTypes: [RoomType.WalkInCloset] },
  { id: 'Full Mirror', label: 'Böyük Güzgü', icon: 'ScanLine', roomTypes: [RoomType.WalkInCloset] },
  { id: 'Hangers', label: 'Asılqanlar', icon: 'Shirt', roomTypes: [RoomType.WalkInCloset] },
  // Hallway
  { id: 'Shoe Rack', label: 'Ayaqqabı Rəfi', icon: 'Box', roomTypes: [RoomType.Hallway] },
  { id: 'Coat Rack', label: 'Asılqan', icon: 'Grid', roomTypes: [RoomType.Hallway] },
  // Balcony
  { id: 'Outdoor Sofa', label: 'Bağ Divanı', icon: 'Sofa', roomTypes: [RoomType.Balcony] },
  { id: 'Plants', label: 'Bitkilər', icon: 'Palmtree', roomTypes: [RoomType.Balcony] },
  // Attic
  { id: 'Low Sofa', label: 'Alçaq Divan', icon: 'Sofa', roomTypes: [RoomType.Attic] },
  { id: 'Storage', label: 'Saxlama', icon: 'Box', roomTypes: [RoomType.Attic] },
  { id: 'Skylight', label: 'Dam Pəncərəsi', icon: 'Grid', roomTypes: [RoomType.Attic] },
  // Basement
  { id: 'Storage Racks', label: 'Rəflər', icon: 'Grid', roomTypes: [RoomType.Basement] },
  { id: 'Pool Table', label: 'Bilyard Masası', icon: 'Layout', roomTypes: [RoomType.Basement] },
  { id: 'Bar Area', label: 'Bar', icon: 'Coffee', roomTypes: [RoomType.Basement] },
];

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  INITIAL_STYLES.forEach(item => {
    const ref = doc(db, 'styles', item.id);
    batch.set(ref, item);
  });

  INITIAL_ROOMS.forEach(item => {
    const ref = doc(db, 'rooms', item.id);
    batch.set(ref, item);
  });

  INITIAL_FLOORING.forEach(item => {
    const ref = doc(db, 'flooring', item.id);
    batch.set(ref, item);
  });

  INITIAL_COLORS.forEach(item => {
    const ref = doc(db, 'colors', item.id);
    batch.set(ref, item);
  });

  INITIAL_FURNITURE.forEach(item => {
    const ref = doc(db, 'furniture', item.id);
    batch.set(ref, item);
  });
  
  INITIAL_PRESETS.forEach(item => {
    const ref = doc(db, 'presets', item.id);
    batch.set(ref, item);
  });

  await batch.commit();
};

export const fetchAppContent = async (): Promise<AppContent> => {
  try {
    // 1. Check if the database is initialized by checking the 'styles' collection
    const stylesRef = collection(db, 'styles');
    const stylesCheck = await getDocs(stylesRef);

    if (stylesCheck.empty) {
      console.log("Database is empty (no styles found). Auto-seeding initial content...");
      await seedDatabase();
      
      // Return the initial data immediately to allow the app to function without reload
      return {
        styles: INITIAL_STYLES,
        rooms: INITIAL_ROOMS,
        flooring: INITIAL_FLOORING,
        colors: INITIAL_COLORS,
        furniture: INITIAL_FURNITURE,
        presets: INITIAL_PRESETS
      };
    }

    // 2. If data exists, fetch all collections in parallel
    const [stylesSnap, roomsSnap, flooringSnap, colorsSnap, furnitureSnap, presetsSnap] = await Promise.all([
      getDocs(collection(db, 'styles')),
      getDocs(collection(db, 'rooms')),
      getDocs(collection(db, 'flooring')),
      getDocs(collection(db, 'colors')),
      getDocs(collection(db, 'furniture')),
      getDocs(collection(db, 'presets'))
    ]);

    return {
      styles: stylesSnap.docs.map(d => d.data() as DbStyle),
      rooms: roomsSnap.docs.map(d => d.data() as DbRoom),
      flooring: flooringSnap.docs.map(d => d.data() as DbFlooring),
      colors: colorsSnap.docs.map(d => d.data() as DbColor),
      furniture: furnitureSnap.docs.map(d => d.data() as DbFurniture),
      presets: presetsSnap.docs.map(d => d.data() as DbPreset)
    };
  } catch (error) {
    console.error("Error fetching app content:", error);
    // Fallback in case of network error, though Firestore offline persistence usually handles this.
    return {
      styles: INITIAL_STYLES,
      rooms: INITIAL_ROOMS,
      flooring: INITIAL_FLOORING,
      colors: INITIAL_COLORS,
      furniture: INITIAL_FURNITURE,
      presets: INITIAL_PRESETS
    };
  }
};
    