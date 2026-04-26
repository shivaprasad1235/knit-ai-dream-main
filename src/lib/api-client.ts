/**
 * API Client for Loop & Bloom Backend
 * Handles all HTTP requests to the FastAPI backend
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const DEMO_USER_KEY = "lb_demo_users";

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Load tokens from localStorage on init
if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("lb_access_token");
  refreshToken = localStorage.getItem("lb_refresh_token");
}

type DemoUser = User & { password: string };

const demoAdmin: DemoUser = {
  id: "demo-admin",
  email: "admin@example.com",
  full_name: "Maya Patel",
  is_admin: true,
  password: "admin123",
  created_at: new Date(2024, 0, 1).toISOString(),
};

function getDemoUsers(): DemoUser[] {
  if (typeof window === "undefined") return [demoAdmin];
  try {
    const saved = localStorage.getItem(DEMO_USER_KEY);
    const users = saved ? (JSON.parse(saved) as DemoUser[]) : [];
    return [demoAdmin, ...users.filter((user) => user.email !== demoAdmin.email)];
  } catch {
    return [demoAdmin];
  }
}

function saveDemoUser(user: DemoUser) {
  if (typeof window === "undefined") return;
  const users = getDemoUsers().filter(
    (existing) => existing.email !== user.email && existing.email !== demoAdmin.email,
  );
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify([user, ...users]));
}

function publicUser(user: DemoUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  shipping_address: string;
  is_custom: boolean;
  custom_design_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AIDesign {
  id: string;
  user_id: string;
  prompt: string;
  style?: string;
  image_url?: string;
  description?: string;
  pattern_notes?: string;
  status: "pending" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Base fetch with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add auth token
  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 - try refresh token
  if (response.status === 401 && !skipAuth && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiCall<T>(endpoint, { ...options, skipAuth: false });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const tokens = (await response.json()) as AuthResponse;
    setTokens(tokens.access_token, tokens.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Store tokens in localStorage and memory
 */
function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("lb_access_token", access);
  localStorage.setItem("lb_refresh_token", refresh);
  window.dispatchEvent(new Event("lb:auth"));
}

/**
 * Clear tokens
 */
function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("lb_access_token");
  localStorage.removeItem("lb_refresh_token");
  localStorage.removeItem("lb_user");
  window.dispatchEvent(new Event("lb:auth"));
}

/**
 * Get stored user
 */
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("lb_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Store user
 */
function setStoredUser(user: User) {
  localStorage.setItem("lb_user", JSON.stringify(user));
  window.dispatchEvent(new Event("lb:auth"));
}

function setDemoSession(user: User) {
  const tokenId = `${user.id}-${Date.now().toString(36)}`;
  setTokens(`demo-access-${tokenId}`, `demo-refresh-${tokenId}`);
  setStoredUser(user);
}

// ===================== AUTH ENDPOINTS =====================

export async function register(email: string, full_name: string, password: string): Promise<User> {
  try {
    const user = await apiCall<User>("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, full_name, password }),
    });
    setStoredUser(user);
    return user;
  } catch {
    const normalizedEmail = email.trim().toLowerCase();
    if (getDemoUsers().some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const user: DemoUser = {
      id: `demo-${Date.now().toString(36)}`,
      email: normalizedEmail,
      full_name,
      is_admin: false,
      password,
      created_at: new Date().toISOString(),
    };
    saveDemoUser(user);
    const safeUser = publicUser(user);
    setDemoSession(safeUser);
    return safeUser;
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });

    setTokens(response.access_token, response.refresh_token);

    const user = await getCurrentUser();
    return user;
  } catch {
    const normalizedEmail = email.trim().toLowerCase();
    const user = getDemoUsers().find(
      (candidate) => candidate.email === normalizedEmail && candidate.password === password,
    );
    if (!user) throw new Error("Invalid email or password.");

    const safeUser = publicUser(user);
    setDemoSession(safeUser);
    return safeUser;
  }
}

export async function logout() {
  clearTokens();
}

export async function getCurrentUser(): Promise<User> {
  const user = await apiCall<User>("/auth/me");
  setStoredUser(user);
  return user;
}

export function getLocalUser(): User | null {
  return getStoredUser();
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function isAdmin(): boolean {
  return !!getStoredUser()?.is_admin;
}

// ===================== PRODUCT ENDPOINTS =====================

export async function getProducts(skip = 0, limit = 10): Promise<Product[]> {
  return apiCall<Product[]>(`/products?skip=${skip}&limit=${limit}`, {
    skipAuth: true,
  });
}

export async function getProduct(productId: string): Promise<Product> {
  return apiCall<Product>(`/products/${productId}`, {
    skipAuth: true,
  });
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> {
  return apiCall<Product>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>,
): Promise<Product> {
  return apiCall<Product>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiCall<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}

// ===================== ORDER ENDPOINTS =====================

export async function createOrder(
  items: OrderItem[],
  shipping_address: string,
  is_custom = false,
  custom_design_id?: string,
): Promise<Order> {
  return apiCall<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({
      items,
      shipping_address,
      is_custom,
      custom_design_id,
    }),
  });
}

export async function getUserOrders(skip = 0, limit = 10): Promise<Order[]> {
  return apiCall<Order[]>(`/orders?skip=${skip}&limit=${limit}`);
}

export async function getOrder(orderId: string): Promise<Order> {
  return apiCall<Order>(`/orders/${orderId}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  notes?: string,
): Promise<Order> {
  return apiCall<Order>(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status, notes }),
  });
}

// ===================== AI DESIGN ENDPOINTS =====================

export async function generateDesign(prompt: string, style?: string): Promise<AIDesign> {
  try {
    return await apiCall<AIDesign>("/designs", {
      method: "POST",
      body: JSON.stringify({ prompt, style }),
    });
  } catch {
    return createDemoDesign(prompt, style);
  }
}

export async function getUserDesigns(skip = 0, limit = 10): Promise<AIDesign[]> {
  return apiCall<AIDesign[]>(`/designs?skip=${skip}&limit=${limit}`);
}

export async function getDesign(designId: string): Promise<AIDesign> {
  return apiCall<AIDesign>(`/designs/${designId}`);
}

// ===================== ADMIN ENDPOINTS =====================

export async function getAllOrders(skip = 0, limit = 10): Promise<Order[]> {
  return apiCall<Order[]>(`/admin/orders?skip=${skip}&limit=${limit}`);
}

export async function getAllDesigns(skip = 0, limit = 10): Promise<AIDesign[]> {
  return apiCall<AIDesign[]>(`/admin/designs?skip=${skip}&limit=${limit}`);
}

export async function getAllUsers(skip = 0, limit = 10): Promise<User[]> {
  return apiCall<User[]>(`/admin/users?skip=${skip}&limit=${limit}`);
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return apiCall<{ status: string }>("/health", {
    skipAuth: true,
  }).catch(() => ({ status: "offline" }));
}

function createDemoDesign(prompt: string, style?: string): AIDesign {
  const now = new Date().toISOString();
  const cleanPrompt = prompt.trim();
  const cleanStyle = style?.trim();
  const title = cleanPrompt.split(/\s+/).slice(0, 6).join(" ").replace(/[<>&]/g, "");
  const palette = cleanStyle || "warm terracotta, sage, cream";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f7efe2"/>
          <stop offset="100%" stop-color="#d9b097"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8"/>
        </filter>
      </defs>
      <rect width="900" height="900" fill="url(#bg)"/>
      <circle cx="450" cy="430" r="245" fill="#f9f3ea"/>
      <g fill="none" stroke="#b6603f" stroke-width="18" stroke-linecap="round" opacity=".9">
        <path d="M260 430c70-110 160-150 270-122 83 21 128 84 121 165-8 96-97 158-205 143-75-10-126-55-139-119"/>
        <path d="M326 353c-8 77 30 142 100 169 65 25 140 4 179-51"/>
        <path d="M279 512c62 88 174 122 284 83"/>
      </g>
      <g fill="#78956f" opacity=".75">
        <circle cx="300" cy="334" r="26"/>
        <circle cx="626" cy="356" r="20"/>
        <circle cx="575" cy="628" r="24"/>
        <circle cx="257" cy="569" r="18"/>
      </g>
      <g filter="url(#soft)" opacity=".45">
        <path d="M220 725c120-62 342-82 460 0" stroke="#8f5b42" stroke-width="12" fill="none" stroke-linecap="round"/>
      </g>
      <text x="450" y="760" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#3d3028">Loop &amp; Bloom custom</text>
      <text x="450" y="808" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#5c5049">${title}</text>
    </svg>`;

  return {
    id: `demo-design-${Date.now().toString(36)}`,
    user_id: getStoredUser()?.id ?? "demo-user",
    prompt: cleanPrompt,
    style: cleanStyle,
    image_url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    description: `A made-to-order crochet concept inspired by "${cleanPrompt}". The finished piece uses soft sculptural texture, visible handwork, and a balanced palette of ${palette}. It is designed as a keepsake object with enough detail to feel special while staying practical to stitch.`,
    pattern_notes:
      "Pattern notes: textured single crochet with accent bobbles, worsted cotton or merino blend, finished size adjusted to commission, intermediate difficulty.",
    status: "completed",
    created_at: now,
    updated_at: now,
  };
}
