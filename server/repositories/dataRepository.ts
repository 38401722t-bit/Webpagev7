import { isDbConnected } from "../config/db";
import {
  UserModel, IUser,
  TripModel, ITrip,
  WishlistModel, IWishlist,
  AlertModel, IAlert,
  NotificationModel, INotification,
  FeedbackModel, IFeedback,
  WeatherCacheModel, IWeatherCache,
  PlaceImageModel, IPlaceImage,
  AIConversationModel, IAIConversation
} from "../models/schema";
import bcrypt from "bcryptjs";

// In-Memory Storage Fallback
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
}

export interface WishlistRecord {
  id: string;
  user_id: string;
  destination_id: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface TripRecord {
  id: string;
  user_id: string;
  title: string;
  destination_ids: string[];
  start_date: string;
  end_date: string;
  budget: number;
  travel_style?: string;
  share_token?: string | null;
  members: string[];
  itineraryDays?: any[];
  created_at: string;
}

export interface AlertRecord {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  level: "info" | "warning" | "danger";
  destination_id?: string;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface FeedbackRecord {
  id: string;
  destination_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  photo_path?: string | null;
  created_at: string;
}

// Initial Memory Stores
const memoryUsers = new Map<string, UserRecord>();
const memoryUsersByEmail = new Map<string, UserRecord>();

// Seed default demo user in memory
const defaultDemoUser: UserRecord = {
  id: "user-demo-1",
  name: "Kiran Explorer",
  email: "kiran@exploro.in",
  phone: "+91 98765 43210",
  passwordHash: bcrypt.hashSync("exploro123", 10),
  createdAt: new Date().toISOString(),
};
memoryUsers.set(defaultDemoUser.id, defaultDemoUser);
memoryUsersByEmail.set(defaultDemoUser.email, defaultDemoUser);

const memoryWishlist: WishlistRecord[] = [
  {
    id: "wl-1",
    user_id: defaultDemoUser.id,
    destination_id: "rj-jaipur",
    notes: "Must visit Amber Fort at sunrise",
    status: "planned",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "wl-2",
    user_id: defaultDemoUser.id,
    destination_id: "kl-alleppey",
    notes: "Overnight houseboat cruise",
    status: "bucket_list",
    created_at: new Date().toISOString(),
  },
];

const memoryTrips: TripRecord[] = [
  {
    id: "trip-demo-1",
    user_id: defaultDemoUser.id,
    title: "Golden Triangle & Backwaters",
    destination_ids: ["dl-delhi", "up-agra", "rj-jaipur", "kl-alleppey"],
    start_date: "2026-10-15",
    end_date: "2026-10-23",
    budget: 45000,
    travel_style: "heritage & culture",
    share_token: "golden-triangle-2026",
    members: [defaultDemoUser.email],
    created_at: new Date().toISOString(),
  },
];

const memoryAlerts: AlertRecord[] = [
  {
    id: "al-1",
    user_id: defaultDemoUser.id,
    title: "Autumn Festival Season in Jaipur",
    message: "Diwali illumination celebrations starting soon. Book heritage monuments in advance.",
    level: "info",
    destination_id: "rj-jaipur",
    created_at: new Date().toISOString(),
  },
];

const memoryFeedback: FeedbackRecord[] = [
  {
    id: "fb-1",
    destination_id: "up-agra",
    user_id: defaultDemoUser.id,
    user_name: "Kiran Explorer",
    rating: 5,
    comment: "The Taj Mahal early morning before 7 AM is utterly breathtaking and peaceful. Highly recommend getting an audio guide.",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "fb-2",
    destination_id: "kl-munnar",
    user_id: defaultDemoUser.id,
    user_name: "Kiran Explorer",
    rating: 5,
    comment: "Rolling green tea estates covered in morning mist. The fresh cardamom tea in local shops is unmatched.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const memoryNotifications: NotificationRecord[] = [
  {
    id: "nt-1",
    user_id: defaultDemoUser.id,
    title: "Welcome to Exploro India!",
    message: "Discover 1,900+ Indian tourist places, live weather, crowd predictions, and AI route planner.",
    read: false,
    created_at: new Date().toISOString(),
  },
];

const memoryWeatherCache = new Map<string, { data: any; expiresAt: number }>();
const memoryPlaceImages = new Map<string, any[]>();

export const DataRepository = {
  // --- USERS ---
  async findUserById(id: string): Promise<UserRecord | null> {
    if (isDbConnected()) {
      const doc = await UserModel.findOne({ id }).lean();
      if (doc) return { ...doc, id: doc.id } as any;
    }
    return memoryUsers.get(id) || null;
  },

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const clean = email.toLowerCase().trim();
    if (isDbConnected()) {
      const doc = await UserModel.findOne({ email: clean }).lean();
      if (doc) return { ...doc, id: doc.id } as any;
    }
    return memoryUsersByEmail.get(clean) || null;
  },

  async createUser(user: UserRecord): Promise<UserRecord> {
    if (isDbConnected()) {
      await UserModel.create({
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase().trim(),
        phone: user.phone || "",
        passwordHash: user.passwordHash,
      });
    }
    memoryUsers.set(user.id, user);
    memoryUsersByEmail.set(user.email.toLowerCase().trim(), user);
    return user;
  },

  async updateUserProfile(id: string, updates: { name?: string; phone?: string }): Promise<UserRecord | null> {
    if (isDbConnected()) {
      const doc = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      if (doc) {
        const rec = { ...doc, id: doc.id } as any;
        memoryUsers.set(id, rec);
        memoryUsersByEmail.set(rec.email, rec);
        return rec;
      }
    }
    const user = memoryUsers.get(id);
    if (!user) return null;
    if (updates.name) user.name = updates.name.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    return user;
  },

  // --- WISHLIST ---
  async getWishlist(userId: string): Promise<WishlistRecord[]> {
    if (isDbConnected()) {
      const docs = await WishlistModel.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
      return docs.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        destination_id: d.destination_id,
        notes: d.notes,
        status: d.status,
        created_at: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }
    return memoryWishlist.filter((w) => w.user_id === userId);
  },

  async addWishlistItem(item: WishlistRecord): Promise<WishlistRecord> {
    if (isDbConnected()) {
      await WishlistModel.findOneAndUpdate(
        { user_id: item.user_id, destination_id: item.destination_id },
        { $set: { id: item.id, notes: item.notes, status: item.status } },
        { upsert: true, new: true }
      );
    }
    const idx = memoryWishlist.findIndex(
      (w) => w.user_id === item.user_id && w.destination_id === item.destination_id
    );
    if (idx !== -1) {
      memoryWishlist[idx] = { ...memoryWishlist[idx], ...item };
      return memoryWishlist[idx];
    }
    memoryWishlist.unshift(item);
    return item;
  },

  async updateWishlistItem(userId: string, itemId: string, updates: { notes?: string; status?: string }): Promise<WishlistRecord | null> {
    if (isDbConnected()) {
      const doc = await WishlistModel.findOneAndUpdate(
        { id: itemId, user_id: userId },
        { $set: updates },
        { new: true }
      ).lean();
      if (doc) return { ...doc, id: doc.id, created_at: (doc as any).createdAt?.toISOString() } as any;
    }
    const item = memoryWishlist.find((w) => w.id === itemId && w.user_id === userId);
    if (!item) return null;
    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.status !== undefined) item.status = updates.status;
    return item;
  },

  async deleteWishlistItem(userId: string, targetId: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await WishlistModel.deleteOne({
        user_id: userId,
        $or: [{ id: targetId }, { destination_id: targetId }],
      });
      if (res.deletedCount && res.deletedCount > 0) return true;
    }
    const idx = memoryWishlist.findIndex(
      (w) => w.user_id === userId && (w.id === targetId || w.destination_id === targetId)
    );
    if (idx !== -1) {
      memoryWishlist.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- TRIPS ---
  async getTrips(userId: string, userEmail?: string): Promise<TripRecord[]> {
    if (isDbConnected()) {
      const orConditions: any[] = [{ user_id: userId }];
      if (userEmail) orConditions.push({ members: userEmail });
      const docs = await TripModel.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
      return docs.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        title: d.title,
        destination_ids: d.destination_ids,
        start_date: d.start_date,
        end_date: d.end_date,
        budget: d.budget,
        travel_style: d.travel_style,
        share_token: d.share_token,
        members: d.members,
        itineraryDays: d.itineraryDays,
        created_at: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }
    return memoryTrips.filter(
      (t) => t.user_id === userId || (userEmail && t.members?.includes(userEmail))
    );
  },

  async getTripById(tripId: string): Promise<TripRecord | null> {
    if (isDbConnected()) {
      const d = await TripModel.findOne({ id: tripId }).lean();
      if (d) return { ...d, id: d.id, created_at: (d as any).createdAt?.toISOString() } as any;
    }
    return memoryTrips.find((t) => t.id === tripId) || null;
  },

  async getTripByShareToken(token: string): Promise<TripRecord | null> {
    if (isDbConnected()) {
      const d = await TripModel.findOne({ share_token: token }).lean();
      if (d) return { ...d, id: d.id, created_at: (d as any).createdAt?.toISOString() } as any;
    }
    return memoryTrips.find((t) => t.share_token === token) || null;
  },

  async createTrip(trip: TripRecord): Promise<TripRecord> {
    if (isDbConnected()) {
      await TripModel.create({
        id: trip.id,
        user_id: trip.user_id,
        title: trip.title,
        destination_ids: trip.destination_ids,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget: trip.budget,
        travel_style: trip.travel_style,
        share_token: trip.share_token,
        members: trip.members,
        itineraryDays: trip.itineraryDays || [],
      });
    }
    memoryTrips.unshift(trip);
    return trip;
  },

  async updateTrip(userId: string, tripId: string, updates: Partial<TripRecord>): Promise<TripRecord | null> {
    if (isDbConnected()) {
      const doc = await TripModel.findOneAndUpdate(
        { id: tripId, user_id: userId },
        { $set: updates },
        { new: true }
      ).lean();
      if (doc) return { ...doc, id: doc.id, created_at: (doc as any).createdAt?.toISOString() } as any;
    }
    const trip = memoryTrips.find((t) => t.id === tripId && t.user_id === userId);
    if (!trip) return null;
    Object.assign(trip, updates);
    return trip;
  },

  async deleteTrip(userId: string, tripId: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await TripModel.deleteOne({ id: tripId, user_id: userId });
      if (res.deletedCount && res.deletedCount > 0) return true;
    }
    const idx = memoryTrips.findIndex((t) => t.id === tripId && t.user_id === userId);
    if (idx !== -1) {
      memoryTrips.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- ALERTS ---
  async getAlerts(): Promise<AlertRecord[]> {
    if (isDbConnected()) {
      const docs = await AlertModel.find().sort({ createdAt: -1 }).limit(50).lean();
      return docs.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        title: d.title,
        message: d.message,
        level: d.level,
        destination_id: d.destination_id,
        created_at: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }
    return memoryAlerts;
  },

  async createAlert(alert: AlertRecord): Promise<AlertRecord> {
    if (isDbConnected()) {
      await AlertModel.create(alert);
    }
    memoryAlerts.unshift(alert);
    return alert;
  },

  async deleteAlert(alertId: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await AlertModel.deleteOne({ id: alertId });
      if (res.deletedCount && res.deletedCount > 0) return true;
    }
    const idx = memoryAlerts.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      memoryAlerts.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<NotificationRecord[]> {
    if (isDbConnected()) {
      const docs = await NotificationModel.find({ user_id: userId }).sort({ createdAt: -1 }).limit(30).lean();
      return docs.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        title: d.title,
        message: d.message,
        read: d.read,
        created_at: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }
    return memoryNotifications.filter((n) => n.user_id === userId);
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isDbConnected()) {
      await NotificationModel.updateOne({ id }, { $set: { read: true } });
    }
    const n = memoryNotifications.find((item) => item.id === id);
    if (n) n.read = true;
    return true;
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    if (isDbConnected()) {
      await NotificationModel.updateMany({ user_id: userId }, { $set: { read: true } });
    }
    memoryNotifications.filter((n) => n.user_id === userId).forEach((n) => (n.read = true));
    return true;
  },

  // --- FEEDBACK ---
  async getFeedback(destId: string): Promise<{ items: FeedbackRecord[]; count: number; average_rating: number }> {
    if (isDbConnected()) {
      const docs = await FeedbackModel.find({ destination_id: destId }).sort({ createdAt: -1 }).lean();
      const items = docs.map((d: any) => ({
        id: d.id,
        destination_id: d.destination_id,
        user_id: d.user_id,
        user_name: d.user_name,
        rating: d.rating,
        comment: d.comment,
        photo_path: d.photo_path,
        created_at: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
      const avg = items.length ? Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10 : 4.8;
      return { items, count: items.length, average_rating: avg };
    }
    const items = memoryFeedback.filter((f) => f.destination_id === destId);
    const avg = items.length ? Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10 : 4.8;
    return { items, count: items.length, average_rating: avg };
  },

  async createFeedback(feedback: FeedbackRecord): Promise<FeedbackRecord> {
    if (isDbConnected()) {
      await FeedbackModel.create(feedback);
    }
    memoryFeedback.unshift(feedback);
    return feedback;
  },

  async deleteFeedback(userId: string, feedbackId: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await FeedbackModel.deleteOne({ id: feedbackId, user_id: userId });
      if (res.deletedCount && res.deletedCount > 0) return true;
    }
    const idx = memoryFeedback.findIndex((f) => f.id === feedbackId && f.user_id === userId);
    if (idx !== -1) {
      memoryFeedback.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- WEATHER CACHE ---
  async getWeatherCache(key: string): Promise<any | null> {
    if (isDbConnected()) {
      const doc = await WeatherCacheModel.findOne({ locationKey: key, expiresAt: { $gt: new Date() } }).lean();
      if (doc) return (doc as any).data;
    }
    const mem = memoryWeatherCache.get(key);
    if (mem && mem.expiresAt > Date.now()) return mem.data;
    return null;
  },

  async setWeatherCache(key: string, lat: number, lon: number, data: any, ttlSeconds = 1800): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    if (isDbConnected()) {
      await WeatherCacheModel.findOneAndUpdate(
        { locationKey: key },
        { $set: { lat, lon, data, cachedAt: new Date(), expiresAt } },
        { upsert: true }
      );
    }
    memoryWeatherCache.set(key, { data, expiresAt: expiresAt.getTime() });
  },

  // --- PLACE IMAGES ---
  async getPlaceImages(placeId: string): Promise<any[]> {
    if (isDbConnected()) {
      const docs = await PlaceImageModel.find({ placeId }).sort({ isPrimary: -1, qualityScore: -1 }).lean();
      if (docs.length) return docs;
    }
    return memoryPlaceImages.get(placeId) || [];
  },

  async savePlaceImage(img: any): Promise<void> {
    if (isDbConnected()) {
      await PlaceImageModel.findOneAndUpdate(
        { placeId: img.placeId, imageUrl: img.imageUrl },
        { $set: img },
        { upsert: true }
      );
    }
    const list = memoryPlaceImages.get(img.placeId) || [];
    const idx = list.findIndex((x) => x.imageUrl === img.imageUrl);
    if (idx !== -1) list[idx] = img;
    else list.push(img);
    memoryPlaceImages.set(img.placeId, list);
  },
};
