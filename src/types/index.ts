/**
 * Squarespace API TypeScript Types
 * Complete type definitions for Squarespace v1.0 API
 */

// ============================================================================
// Authentication & Configuration
// ============================================================================

export interface SquarespaceConfig {
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface OAuthTokenResponse {
  token_type: string;
  access_token: string;
  access_token_expires_at: string;
  refresh_token?: string;
  refresh_token_expires_at?: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  result: T[];
  pagination?: {
    hasMore: boolean;
    nextPageCursor?: string;
    nextPageUrl?: string;
  };
}

export interface Money {
  value: string;
  currency: string;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  postalCode?: string;
  phone?: string;
}

export interface ImageMeta {
  width: number;
  height: number;
  focalPoint?: { x: number; y: number };
}

export interface CustomFormField {
  id: string;
  label: string;
  value: string;
}

// ============================================================================
// Commerce - Products
// ============================================================================

export interface Product {
  id: string;
  type: 'PHYSICAL' | 'SERVICE' | 'GIFT_CARD' | 'DIGITAL';
  storePageId: string;
  name: string;
  description?: string;
  url: string;
  urlSlug: string;
  tags?: string[];
  isVisible: boolean;
  seoOptions?: SEOOptions;
  productType?: string;
  shippingFields?: ShippingFields;
  images?: ProductImage[];
  variants: ProductVariant[];
  createdOn: string;
  modifiedOn: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  pricing: VariantPricing;
  stock?: VariantStock;
  attributes?: Record<string, string>;
  image?: ProductImage;
  shippingMeasurements?: ShippingMeasurements;
}

export interface VariantPricing {
  basePrice: Money;
  salePrice?: Money;
  onSale: boolean;
  quantityPricing?: QuantityPricing[];
}

export interface QuantityPricing {
  quantity: number;
  price: Money;
}

export interface VariantStock {
  quantity: number;
  unlimited: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  originalSize: ImageMeta;
  availableFormats: string[];
}

export interface ShippingFields {
  requiresShipping: boolean;
  customShippingProductId?: string;
}

export interface ShippingMeasurements {
  weight?: { value: number; unit: string };
  dimensions?: {
    length?: { value: number; unit: string };
    width?: { value: number; unit: string };
    height?: { value: number; unit: string };
  };
}

export interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface CreateProductRequest {
  type: Product['type'];
  storePageId: string;
  name: string;
  description?: string;
  urlSlug?: string;
  tags?: string[];
  isVisible?: boolean;
  productType?: string;
  variants: CreateVariantRequest[];
}

export interface CreateVariantRequest {
  sku?: string;
  pricing: {
    basePrice: Money;
    salePrice?: Money;
  };
  stock?: {
    quantity: number;
    unlimited: boolean;
  };
  attributes?: Record<string, string>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  urlSlug?: string;
  tags?: string[];
  isVisible?: boolean;
  productType?: string;
  seoOptions?: SEOOptions;
}

// ============================================================================
// Commerce - Orders
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  createdOn: string;
  modifiedOn: string;
  channel: OrderChannel;
  testmode: boolean;
  customerEmail: string;
  billingAddress: Address;
  shippingAddress?: Address;
  fulfillmentStatus: FulfillmentStatus;
  lineItems: LineItem[];
  subtotal: Money;
  shippingTotal: Money;
  discountTotal: Money;
  taxTotal: Money;
  refundedTotal: Money;
  grandTotal: Money;
  priceTaxInterpretation: 'INCLUDED' | 'EXCLUDED';
  customFormFields?: CustomFormField[];
  internalNotes?: Note[];
  fulfillments?: Fulfillment[];
  externalOrderReference?: ExternalOrderReference;
}

export interface OrderChannel {
  type: 'ONLINE' | 'IN_PERSON' | 'DONATION';
  subtype?: string;
}

export type FulfillmentStatus = 
  | 'PENDING'
  | 'FULFILLED' 
  | 'PARTIALLY_FULFILLED'
  | 'CANCELED';

export interface LineItem {
  id: string;
  variantId: string;
  sku?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaid: Money;
  lineItemPricePaid: Money;
  customizations?: LineItemCustomization[];
  imageUrl?: string;
}

export interface LineItemCustomization {
  label: string;
  value: string;
}

export interface Note {
  text: string;
  createdOn: string;
}

export interface Fulfillment {
  id: string;
  createdOn: string;
  lineItems: FulfillmentLineItem[];
  shipments?: Shipment[];
}

export interface FulfillmentLineItem {
  lineItemId: string;
  quantity: number;
}

export interface Shipment {
  shipDate?: string;
  carrierName?: string;
  service?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface ExternalOrderReference {
  source: string;
  externalId: string;
}

export interface CreateOrderRequest {
  channel: OrderChannel;
  customerEmail: string;
  billingAddress: Address;
  shippingAddress?: Address;
  lineItems: CreateLineItemRequest[];
  subtotal: Money;
  shippingTotal?: Money;
  discountTotal?: Money;
  taxTotal?: Money;
  grandTotal: Money;
  testmode?: boolean;
  externalOrderReference?: ExternalOrderReference;
}

export interface CreateLineItemRequest {
  variantId: string;
  quantity: number;
  unitPricePaid: Money;
}

export interface FulfillOrderRequest {
  shouldSendNotification?: boolean;
  lineItems?: FulfillmentLineItem[];
  shipments?: Shipment[];
}

export interface OrdersQueryParams extends PaginationParams {
  modifiedAfter?: string;
  modifiedBefore?: string;
  fulfillmentStatus?: FulfillmentStatus;
}

// ============================================================================
// Commerce - Inventory
// ============================================================================

export interface InventoryItem {
  variantId: string;
  sku?: string;
  quantity: number;
  unlimited: boolean;
}

export interface UpdateInventoryRequest {
  quantity: number;
  unlimited?: boolean;
}

// ============================================================================
// Commerce - Transactions
// ============================================================================

export interface Transaction {
  id: string;
  createdOn: string;
  orderId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: Money;
  gatewayType: string;
}

export type TransactionType = 
  | 'AUTHORIZATION'
  | 'CAPTURE'
  | 'REFUND'
  | 'VOID';

export type TransactionStatus = 
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED';

export interface CreateRefundRequest {
  amount: Money;
  reason?: string;
}

// ============================================================================
// Profiles (Customers, Subscribers, Donors)
// ============================================================================

export interface Profile {
  id: string;
  type: 'CUSTOMER' | 'SUBSCRIBER' | 'DONOR';
  email: string;
  firstName?: string;
  lastName?: string;
  createdOn: string;
  modifiedOn: string;
  addresses?: Address[];
  customerDetails?: CustomerDetails;
  subscriberDetails?: SubscriberDetails;
  donorDetails?: DonorDetails;
}

export interface CustomerDetails {
  totalOrders: number;
  totalRevenue: Money;
  averageOrderValue: Money;
  lastOrderDate?: string;
}

export interface SubscriberDetails {
  mailingLists: string[];
  subscribedOn: string;
}

export interface DonorDetails {
  totalDonations: number;
  totalAmount: Money;
  lastDonationDate?: string;
}

export interface ProfilesQueryParams extends PaginationParams {
  email?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
}

// ============================================================================
// Webhooks
// ============================================================================

export interface WebhookSubscription {
  id: string;
  endpointUrl: string;
  topics: WebhookTopic[];
  createdOn: string;
  isEnabled: boolean;
  secret?: string;
}

export type WebhookTopic = 
  | 'order.create'
  | 'order.update'
  | 'transaction.create'
  | 'transaction.update'
  | 'inventory.update'
  | 'product.create'
  | 'product.update'
  | 'product.delete';

export interface CreateWebhookRequest {
  endpointUrl: string;
  topics: WebhookTopic[];
}

export interface UpdateWebhookRequest {
  endpointUrl?: string;
  topics?: WebhookTopic[];
  isEnabled?: boolean;
}

export interface WebhookTestNotification {
  webhookId: string;
  topic: WebhookTopic;
}

// ============================================================================
// Site & Pages
// ============================================================================

export interface Website {
  id: string;
  siteTitle: string;
  domain: string;
  baseUrl: string;
  timeZone: string;
  language: string;
  currency: string;
  createdOn: string;
  modifiedOn: string;
}

export interface Collection {
  id: string;
  title: string;
  type: string;
  urlSlug: string;
  description?: string;
}

export interface Page {
  id: string;
  collectionId: string;
  title: string;
  urlSlug: string;
  description?: string;
  body?: string;
  type: string;
  publishedOn?: string;
  isPublished: boolean;
  seoOptions?: SEOOptions;
}

export interface CreatePageRequest {
  collectionId: string;
  title: string;
  urlSlug?: string;
  description?: string;
  body?: string;
  isPublished?: boolean;
}

export interface UpdatePageRequest {
  title?: string;
  urlSlug?: string;
  description?: string;
  body?: string;
  isPublished?: boolean;
  seoOptions?: SEOOptions;
}

// ============================================================================
// Forms
// ============================================================================

export interface Form {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedOn: string;
  responses: FormResponse[];
}

export interface FormResponse {
  fieldId: string;
  value: string;
}

export interface FormSubmissionsQueryParams extends PaginationParams {
  submittedAfter?: string;
  submittedBefore?: string;
}

// ============================================================================
// Blog
// ============================================================================

export interface BlogCollection {
  id: string;
  title: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  blogId: string;
  title: string;
  body: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  publishedOn?: string;
  isPublished: boolean;
  urlSlug: string;
  seoOptions?: SEOOptions;
  featuredImage?: ProductImage;
}

export interface CreateBlogPostRequest {
  title: string;
  body: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  isPublished?: boolean;
  urlSlug?: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  body?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  isPublished?: boolean;
  urlSlug?: string;
  seoOptions?: SEOOptions;
}

// ============================================================================
// Analytics
// ============================================================================

export interface AnalyticsParams {
  startDate: string;
  endDate: string;
  metrics?: string[];
}

export interface RevenueMetrics {
  totalRevenue: Money;
  orderCount: number;
  averageOrderValue: Money;
  period: {
    start: string;
    end: string;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: Money;
}

export interface ConversionMetrics {
  sessions: number;
  transactions: number;
  conversionRate: number;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export interface SquarespaceError {
  type: string;
  message: string;
  status: number;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// SquarespaceAPIError is defined in clients/squarespace.ts

// ============================================================================
// API Response Types
// ============================================================================

export interface GetProductsResponse extends PaginatedResponse<Product> {}
export interface GetOrdersResponse extends PaginatedResponse<Order> {}
export interface GetProfilesResponse extends PaginatedResponse<Profile> {}
export interface GetWebhooksResponse {
  webhooks: WebhookSubscription[];
}
export interface GetFormsResponse {
  forms: Form[];
}
export interface GetFormSubmissionsResponse extends PaginatedResponse<FormSubmission> {}
export interface GetBlogPostsResponse extends PaginatedResponse<BlogPost> {}
