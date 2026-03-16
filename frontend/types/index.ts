// Role definitions
export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

// Common base fields from backend
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

// User Profile
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    restaurantId?: string; // Nullable for Super Admin
    restaurant?: Restaurant;
}

// Restaurant Entity
export interface Restaurant extends BaseEntity {
    brandName: string;
    brandSlug: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    website?: string;
    logoUrl?: string;
    themeColor: string;
    status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
    qrCodeUrl?: string;
    tenantDbName?: string;
    ownerId: string;
    owner?: User;
    settings?: RestaurantSettings;
    categories?: MenuCategory[];
}

// Restaurant Settings
export interface RestaurantSettings extends BaseEntity {
    restaurantId: string;
    currency: string;
    timezone: string;
    isOrderingEnabled: boolean;
    taxRate: number;
    openHours?: any; // JSON structure for business hours
}

// Menu Category
export interface MenuCategory extends BaseEntity {
    restaurantId: string;
    name: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
    items?: MenuItem[];
}

// Menu Item
export interface MenuItem extends BaseEntity {
    categoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spiceLevel: number;
    sortOrder: number;
    category?: MenuCategory;
    variants?: ItemVariant[];
    discounts?: ItemDiscount[];
}

// Item Variant
export interface ItemVariant extends BaseEntity {
    itemId: string;
    name: string;
    priceModifier: number;
    isAvailable: boolean;
    item?: MenuItem;
}

// Item Discount
export interface ItemDiscount extends BaseEntity {
    itemId: string;
    name: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    item?: MenuItem;
}

// Audit Log (Super Admin)
export interface AuditLog extends BaseEntity {
    userId?: string;
    restaurantId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any; // JSON payload of changes
    ipAddress?: string;
    userAgent?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: any; // Pagination info, etc.
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
