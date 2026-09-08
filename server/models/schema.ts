import mongoose, { Schema, Document } from "mongoose";

// 1. User
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// 2. TouristPlace & Destination
export interface ITouristPlace extends Document {
  id: string;
  name: string;
  slug: string;
  state: string;
  city?: string;
  district?: string;
  region: string;
  category: string;
  subcategories: string[];
  lat: number;
  lon: number;
  rating: number;
  image: string;
  images: string[];
  bestSeason: string;
  openingHours?: string;
  entryFee?: number;
  estimatedVisitDuration?: string;
  popularity?: number;
  description: string;
  shortDescription?: string;
  tags: string[];
  activities: string[];
  nearbyPlaces: string[];
  transportInfo?: string;
  safetyInfo?: string;
}

const TouristPlaceSchema = new Schema<ITouristPlace>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  slug: { type: String, index: true },
  state: { type: String, required: true, index: true },
  city: { type: String, index: true },
  district: { type: String },
  region: { type: String, index: true },
  category: { type: String, index: true },
  subcategories: [{ type: String }],
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  rating: { type: Number, default: 4.5, index: true },
  image: { type: String },
  images: [{ type: String }],
  bestSeason: { type: String },
  openingHours: { type: String },
  entryFee: { type: Number, default: 0 },
  estimatedVisitDuration: { type: String },
  popularity: { type: Number, default: 80, index: true },
  description: { type: String },
  shortDescription: { type: String },
  tags: [{ type: String, index: true }],
  activities: [{ type: String }],
  nearbyPlaces: [{ type: String }],
  transportInfo: { type: String },
  safetyInfo: { type: String },
}, { timestamps: true });

TouristPlaceSchema.index({ lat: 1, lon: 1 });
TouristPlaceSchema.index({ name: "text", description: "text", state: "text", tags: "text" });

export const TouristPlaceModel = mongoose.models.TouristPlace || mongoose.model<ITouristPlace>("TouristPlace", TouristPlaceSchema);

// 3. PlaceImage (Phase 13)
export interface IPlaceImage extends Document {
  placeId: string;
  provider: "pexels" | "unsplash" | "wikimedia" | "local" | "placeholder";
  providerImageId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  author?: string;
  authorUrl?: string;
  license?: string;
  licenseUrl?: string;
  altText: string;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square";
  qualityScore: number;
  relevanceScore: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceImageSchema = new Schema<IPlaceImage>({
  placeId: { type: String, required: true, index: true },
  provider: { type: String, required: true, enum: ["pexels", "unsplash", "wikimedia", "local", "placeholder"] },
  providerImageId: { type: String },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  sourceUrl: { type: String },
  author: { type: String },
  authorUrl: { type: String },
  license: { type: String },
  licenseUrl: { type: String },
  altText: { type: String, default: "" },
  width: { type: Number },
  height: { type: Number },
  orientation: { type: String, enum: ["landscape", "portrait", "square"] },
  qualityScore: { type: Number, default: 80 },
  relevanceScore: { type: Number, default: 90 },
  isPrimary: { type: Boolean, default: false, index: true },
}, { timestamps: true });

PlaceImageSchema.index({ placeId: 1, isPrimary: -1 });

export const PlaceImageModel = mongoose.models.PlaceImage || mongoose.model<IPlaceImage>("PlaceImage", PlaceImageSchema);

// 4. Trip
export interface ITrip extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>({
  id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  destination_ids: [{ type: String }],
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  budget: { type: Number, default: 25000 },
  travel_style: { type: String },
  share_token: { type: String, unique: true, sparse: true, index: true },
  members: [{ type: String }],
  itineraryDays: { type: Array, default: [] },
}, { timestamps: true });

export const TripModel = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

// 5. Wishlist
export interface IWishlist extends Document {
  id: string;
  user_id: string;
  destination_id: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  destination_id: { type: String, required: true, index: true },
  notes: { type: String },
  status: { type: String, default: "planned" },
}, { timestamps: true });

WishlistSchema.index({ user_id: 1, destination_id: 1 }, { unique: true });

export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);

// 6. Alert
export interface IAlert extends Document {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  level: "info" | "warning" | "danger";
  destination_id?: string;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ["info", "warning", "danger"], default: "info" },
  destination_id: { type: String, index: true },
}, { timestamps: true });

export const AlertModel = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);

// 7. Notification
export interface INotification extends Document {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

// 8. Feedback
export interface IFeedback extends Document {
  id: string;
  destination_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  photo_path?: string | null;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  id: { type: String, required: true, unique: true, index: true },
  destination_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true, index: true },
  user_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  photo_path: { type: String, default: null },
}, { timestamps: true });

export const FeedbackModel = mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);

// 9. WeatherCache
export interface IWeatherCache extends Document {
  locationKey: string;
  lat: number;
  lon: number;
  data: any;
  cachedAt: Date;
  expiresAt: Date;
}

const WeatherCacheSchema = new Schema<IWeatherCache>({
  locationKey: { type: String, required: true, unique: true, index: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const WeatherCacheModel = mongoose.models.WeatherCache || mongoose.model<IWeatherCache>("WeatherCache", WeatherCacheSchema);

// 10. AIConversation
export interface IAIConversation extends Document {
  sessionId: string;
  userId?: string;
  tripId?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    structuredOutput?: any;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  tripId: { type: String, index: true },
  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    structuredOutput: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export const AIConversationModel = mongoose.models.AIConversation || mongoose.model<IAIConversation>("AIConversation", AIConversationSchema);
