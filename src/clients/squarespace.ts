/**
 * Squarespace API Client
 * Comprehensive client with OAuth2, pagination, error handling, and retry logic
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  SquarespaceConfig,
  OAuthTokenResponse,
  PaginatedResponse,
  PaginationParams,
  // Products
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  GetProductsResponse,
  ProductVariant,
  ProductImage,
  // Orders
  Order,
  CreateOrderRequest,
  FulfillOrderRequest,
  OrdersQueryParams,
  GetOrdersResponse,
  // Inventory
  InventoryItem,
  UpdateInventoryRequest,
  // Transactions
  Transaction,
  CreateRefundRequest,
  // Profiles
  Profile,
  ProfilesQueryParams,
  GetProfilesResponse,
  // Webhooks
  WebhookSubscription,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookTestNotification,
  GetWebhooksResponse,
  // Site & Pages
  Website,
  Collection,
  Page,
  CreatePageRequest,
  UpdatePageRequest,
  // Forms
  Form,
  FormSubmission,
  FormSubmissionsQueryParams,
  GetFormSubmissionsResponse,
  // Blog
  BlogCollection,
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  GetBlogPostsResponse,
  // Analytics
  AnalyticsParams,
  RevenueMetrics,
  ProductPerformance,
  ConversionMetrics,
} from '../types/index.js';

const DEFAULT_BASE_URL = 'https://api.squarespace.com/1.0';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const OAUTH_TOKEN_URL = 'https://login.squarespace.com/api/1/login/oauth/provider/tokens';

export class SquarespaceClient {
  private client: AxiosInstance;
  private accessToken: string;
  private refreshToken?: string;
  private clientId?: string;
  private clientSecret?: string;
  private retryAttempts: number;
  private tokenExpiresAt?: Date;

  constructor(config: SquarespaceConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;

    this.client = axios.create({
      baseURL: config.baseUrl || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'User-Agent': 'Squarespace-MCP-Server/1.0',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth and handle token refresh
    this.client.interceptors.request.use(
      async (config) => {
        // Check if token needs refresh
        if (this.shouldRefreshToken()) {
          await this.refreshAccessToken();
        }
        
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.refreshToken) {
          // Token expired, try to refresh
          try {
            await this.refreshAccessToken();
            // Retry the original request
            const config = error.config;
            if (config) {
              config.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client.request(config);
            }
          } catch (refreshError) {
            return Promise.reject(this.handleError(refreshError as AxiosError));
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if access token should be refreshed
   */
  private shouldRefreshToken(): boolean {
    if (!this.tokenExpiresAt || !this.refreshToken) {
      return false;
    }
    // Refresh if less than 5 minutes remaining
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= this.tokenExpiresAt.getTime() - fiveMinutes;
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      throw new Error('Missing refresh token or OAuth credentials');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post<OAuthTokenResponse>(
        OAUTH_TOKEN_URL,
        {
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Squarespace-MCP-Server/1.0',
          },
        }
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      
      // Set expiration time (30 minutes from now)
      this.tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    } catch (error) {
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Handle API errors and convert to SquarespaceAPIError
   */
  private handleError(error: AxiosError): SquarespaceAPIError {
    const response = error.response;
    const status = response?.status || 500;
    const data = response?.data as any;

    return new SquarespaceAPIError(
      status,
      data?.type || 'UNKNOWN_ERROR',
      data?.message || error.message || 'An unknown error occurred',
      data?.errors
    );
  }

  /**
   * Make a request with automatic retry logic
   */
  private async makeRequest<T>(
    config: AxiosRequestConfig,
    attempt: number = 0
  ): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Retry on 429 (rate limit) or 5xx errors
      if (
        attempt < this.retryAttempts &&
        (axiosError.response?.status === 429 || 
         (axiosError.response?.status && axiosError.response.status >= 500))
      ) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(config, attempt + 1);
      }
      
      throw error;
    }
  }

  // ============================================================================
  // Products API
  // ============================================================================

  async getProducts(params?: PaginationParams): Promise<GetProductsResponse> {
    return this.makeRequest<GetProductsResponse>({
      method: 'GET',
      url: '/commerce/products',
      params,
    });
  }

  async getProduct(productId: string): Promise<Product> {
    return this.makeRequest<Product>({
      method: 'GET',
      url: `/commerce/products/${productId}`,
    });
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return this.makeRequest<Product>({
      method: 'POST',
      url: '/commerce/products',
      data: product,
    });
  }

  async updateProduct(productId: string, updates: UpdateProductRequest): Promise<Product> {
    return this.makeRequest<Product>({
      method: 'PUT',
      url: `/commerce/products/${productId}`,
      data: updates,
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/commerce/products/${productId}`,
    });
  }

  async createProductVariant(productId: string, variant: any): Promise<ProductVariant> {
    return this.makeRequest<ProductVariant>({
      method: 'POST',
      url: `/commerce/products/${productId}/variants`,
      data: variant,
    });
  }

  async updateProductVariant(
    productId: string,
    variantId: string,
    updates: any
  ): Promise<ProductVariant> {
    return this.makeRequest<ProductVariant>({
      method: 'PUT',
      url: `/commerce/products/${productId}/variants/${variantId}`,
      data: updates,
    });
  }

  async deleteProductVariant(productId: string, variantId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/commerce/products/${productId}/variants/${variantId}`,
    });
  }

  async uploadProductImage(productId: string, imageFile: Buffer): Promise<ProductImage> {
    return this.makeRequest<ProductImage>({
      method: 'POST',
      url: `/commerce/products/${productId}/images`,
      data: imageFile,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  }

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/commerce/products/${productId}/images/${imageId}`,
    });
  }

  async reorderProductImage(productId: string, imageId: string, position: number): Promise<void> {
    await this.makeRequest({
      method: 'POST',
      url: `/commerce/products/${productId}/images/${imageId}/reorder`,
      data: { position },
    });
  }

  // ============================================================================
  // Orders API
  // ============================================================================

  async getOrders(params?: OrdersQueryParams): Promise<GetOrdersResponse> {
    return this.makeRequest<GetOrdersResponse>({
      method: 'GET',
      url: '/commerce/orders',
      params,
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.makeRequest<Order>({
      method: 'GET',
      url: `/commerce/orders/${orderId}`,
    });
  }

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    return this.makeRequest<Order>({
      method: 'POST',
      url: '/commerce/orders',
      data: order,
    });
  }

  async fulfillOrder(orderId: string, fulfillment: FulfillOrderRequest): Promise<Order> {
    return this.makeRequest<Order>({
      method: 'POST',
      url: `/commerce/orders/${orderId}/fulfillments`,
      data: fulfillment,
    });
  }

  async addOrderNote(orderId: string, note: string): Promise<Order> {
    return this.makeRequest<Order>({
      method: 'POST',
      url: `/commerce/orders/${orderId}/notes`,
      data: { text: note },
    });
  }

  // ============================================================================
  // Inventory API
  // ============================================================================

  async getInventory(variantId: string): Promise<InventoryItem> {
    return this.makeRequest<InventoryItem>({
      method: 'GET',
      url: `/commerce/inventory/${variantId}`,
    });
  }

  async updateInventory(variantId: string, updates: UpdateInventoryRequest): Promise<InventoryItem> {
    return this.makeRequest<InventoryItem>({
      method: 'PUT',
      url: `/commerce/inventory/${variantId}`,
      data: updates,
    });
  }

  async adjustInventory(variantId: string, adjustment: number): Promise<InventoryItem> {
    return this.makeRequest<InventoryItem>({
      method: 'POST',
      url: `/commerce/inventory/${variantId}/adjust`,
      data: { adjustment },
    });
  }

  // ============================================================================
  // Transactions API
  // ============================================================================

  async getTransactions(orderId: string): Promise<Transaction[]> {
    const response = await this.makeRequest<{ transactions: Transaction[] }>({
      method: 'GET',
      url: `/commerce/orders/${orderId}/transactions`,
    });
    return response.transactions;
  }

  async createRefund(orderId: string, refund: CreateRefundRequest): Promise<Transaction> {
    return this.makeRequest<Transaction>({
      method: 'POST',
      url: `/commerce/orders/${orderId}/refunds`,
      data: refund,
    });
  }

  // ============================================================================
  // Profiles API (Customers, Subscribers, Donors)
  // ============================================================================

  async getProfiles(params?: ProfilesQueryParams): Promise<GetProfilesResponse> {
    return this.makeRequest<GetProfilesResponse>({
      method: 'GET',
      url: '/profiles',
      params,
    });
  }

  async getProfile(profileId: string): Promise<Profile> {
    return this.makeRequest<Profile>({
      method: 'GET',
      url: `/profiles/${profileId}`,
    });
  }

  async getCustomers(params?: ProfilesQueryParams): Promise<GetProfilesResponse> {
    return this.makeRequest<GetProfilesResponse>({
      method: 'GET',
      url: '/profiles',
      params: { ...params, type: 'CUSTOMER' },
    });
  }

  async getSubscribers(params?: ProfilesQueryParams): Promise<GetProfilesResponse> {
    return this.makeRequest<GetProfilesResponse>({
      method: 'GET',
      url: '/profiles',
      params: { ...params, type: 'SUBSCRIBER' },
    });
  }

  async getDonors(params?: ProfilesQueryParams): Promise<GetProfilesResponse> {
    return this.makeRequest<GetProfilesResponse>({
      method: 'GET',
      url: '/profiles',
      params: { ...params, type: 'DONOR' },
    });
  }

  // ============================================================================
  // Webhooks API
  // ============================================================================

  async getWebhooks(): Promise<WebhookSubscription[]> {
    const response = await this.makeRequest<GetWebhooksResponse>({
      method: 'GET',
      url: '/webhook_subscriptions',
    });
    return response.webhooks;
  }

  async getWebhook(webhookId: string): Promise<WebhookSubscription> {
    return this.makeRequest<WebhookSubscription>({
      method: 'GET',
      url: `/webhook_subscriptions/${webhookId}`,
    });
  }

  async createWebhook(webhook: CreateWebhookRequest): Promise<WebhookSubscription> {
    return this.makeRequest<WebhookSubscription>({
      method: 'POST',
      url: '/webhook_subscriptions',
      data: webhook,
    });
  }

  async updateWebhook(
    webhookId: string,
    updates: UpdateWebhookRequest
  ): Promise<WebhookSubscription> {
    return this.makeRequest<WebhookSubscription>({
      method: 'PUT',
      url: `/webhook_subscriptions/${webhookId}`,
      data: updates,
    });
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/webhook_subscriptions/${webhookId}`,
    });
  }

  async sendWebhookTest(notification: WebhookTestNotification): Promise<void> {
    await this.makeRequest({
      method: 'POST',
      url: `/webhook_subscriptions/${notification.webhookId}/test`,
      data: { topic: notification.topic },
    });
  }

  async rotateWebhookSecret(webhookId: string): Promise<WebhookSubscription> {
    return this.makeRequest<WebhookSubscription>({
      method: 'POST',
      url: `/webhook_subscriptions/${webhookId}/rotate_secret`,
    });
  }

  // ============================================================================
  // Website & Pages API
  // ============================================================================

  async getWebsite(): Promise<Website> {
    return this.makeRequest<Website>({
      method: 'GET',
      url: '/website',
    });
  }

  async getCollections(): Promise<Collection[]> {
    const response = await this.makeRequest<{ collections: Collection[] }>({
      method: 'GET',
      url: '/website/collections',
    });
    return response.collections;
  }

  async getCollection(collectionId: string): Promise<Collection> {
    return this.makeRequest<Collection>({
      method: 'GET',
      url: `/website/collections/${collectionId}`,
    });
  }

  async getPages(collectionId?: string): Promise<Page[]> {
    const url = collectionId
      ? `/website/collections/${collectionId}/pages`
      : '/website/pages';
    const response = await this.makeRequest<{ pages: Page[] }>({
      method: 'GET',
      url,
    });
    return response.pages;
  }

  async getPage(pageId: string): Promise<Page> {
    return this.makeRequest<Page>({
      method: 'GET',
      url: `/website/pages/${pageId}`,
    });
  }

  async createPage(page: CreatePageRequest): Promise<Page> {
    return this.makeRequest<Page>({
      method: 'POST',
      url: `/website/collections/${page.collectionId}/pages`,
      data: page,
    });
  }

  async updatePage(pageId: string, updates: UpdatePageRequest): Promise<Page> {
    return this.makeRequest<Page>({
      method: 'PUT',
      url: `/website/pages/${pageId}`,
      data: updates,
    });
  }

  async deletePage(pageId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/website/pages/${pageId}`,
    });
  }

  // ============================================================================
  // Forms API
  // ============================================================================

  async getForms(): Promise<Form[]> {
    const response = await this.makeRequest<{ forms: Form[] }>({
      method: 'GET',
      url: '/forms',
    });
    return response.forms;
  }

  async getForm(formId: string): Promise<Form> {
    return this.makeRequest<Form>({
      method: 'GET',
      url: `/forms/${formId}`,
    });
  }

  async getFormSubmissions(
    formId?: string,
    params?: FormSubmissionsQueryParams
  ): Promise<GetFormSubmissionsResponse> {
    const url = formId ? `/forms/${formId}/submissions` : '/form_submissions';
    return this.makeRequest<GetFormSubmissionsResponse>({
      method: 'GET',
      url,
      params,
    });
  }

  async getFormSubmission(submissionId: string): Promise<FormSubmission> {
    return this.makeRequest<FormSubmission>({
      method: 'GET',
      url: `/form_submissions/${submissionId}`,
    });
  }

  // ============================================================================
  // Blog API
  // ============================================================================

  async getBlogs(): Promise<BlogCollection[]> {
    const response = await this.makeRequest<{ blogs: BlogCollection[] }>({
      method: 'GET',
      url: '/blogs',
    });
    return response.blogs;
  }

  async getBlog(blogId: string): Promise<BlogCollection> {
    return this.makeRequest<BlogCollection>({
      method: 'GET',
      url: `/blogs/${blogId}`,
    });
  }

  async getBlogPosts(blogId: string, params?: PaginationParams): Promise<GetBlogPostsResponse> {
    return this.makeRequest<GetBlogPostsResponse>({
      method: 'GET',
      url: `/blogs/${blogId}/posts`,
      params,
    });
  }

  async getBlogPost(blogId: string, postId: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>({
      method: 'GET',
      url: `/blogs/${blogId}/posts/${postId}`,
    });
  }

  async createBlogPost(blogId: string, post: CreateBlogPostRequest): Promise<BlogPost> {
    return this.makeRequest<BlogPost>({
      method: 'POST',
      url: `/blogs/${blogId}/posts`,
      data: post,
    });
  }

  async updateBlogPost(
    blogId: string,
    postId: string,
    updates: UpdateBlogPostRequest
  ): Promise<BlogPost> {
    return this.makeRequest<BlogPost>({
      method: 'PUT',
      url: `/blogs/${blogId}/posts/${postId}`,
      data: updates,
    });
  }

  async deleteBlogPost(blogId: string, postId: string): Promise<void> {
    await this.makeRequest({
      method: 'DELETE',
      url: `/blogs/${blogId}/posts/${postId}`,
    });
  }

  async publishBlogPost(blogId: string, postId: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>({
      method: 'POST',
      url: `/blogs/${blogId}/posts/${postId}/publish`,
    });
  }

  async unpublishBlogPost(blogId: string, postId: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>({
      method: 'POST',
      url: `/blogs/${blogId}/posts/${postId}/unpublish`,
    });
  }

  // ============================================================================
  // Analytics API (Custom/Extended)
  // ============================================================================

  async getRevenueMetrics(params: AnalyticsParams): Promise<RevenueMetrics> {
    // This would need to be built from orders data
    const orders = await this.getOrders({
      modifiedAfter: params.startDate,
      modifiedBefore: params.endDate,
    });

    const totalRevenue = orders.result.reduce(
      (sum, order) => sum + parseFloat(order.grandTotal.value),
      0
    );

    return {
      totalRevenue: {
        value: totalRevenue.toFixed(2),
        currency: orders.result[0]?.grandTotal.currency || 'USD',
      },
      orderCount: orders.result.length,
      averageOrderValue: {
        value: orders.result.length > 0 ? (totalRevenue / orders.result.length).toFixed(2) : '0',
        currency: orders.result[0]?.grandTotal.currency || 'USD',
      },
      period: {
        start: params.startDate,
        end: params.endDate,
      },
    };
  }

  async getTopProducts(params: AnalyticsParams, limit: number = 10): Promise<ProductPerformance[]> {
    // Build from orders data
    const orders = await this.getOrders({
      modifiedAfter: params.startDate,
      modifiedBefore: params.endDate,
    });

    const productStats = new Map<string, { name: string; units: number; revenue: number; currency: string }>();

    orders.result.forEach(order => {
      order.lineItems.forEach(item => {
        const existing = productStats.get(item.productId) || {
          name: item.productName,
          units: 0,
          revenue: 0,
          currency: item.lineItemPricePaid.currency,
        };
        existing.units += item.quantity;
        existing.revenue += parseFloat(item.lineItemPricePaid.value);
        productStats.set(item.productId, existing);
      });
    });

    return Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        unitsSold: stats.units,
        revenue: {
          value: stats.revenue.toFixed(2),
          currency: stats.currency,
        },
      }))
      .sort((a, b) => parseFloat(b.revenue.value) - parseFloat(a.revenue.value))
      .slice(0, limit);
  }
}

export class SquarespaceAPIError extends Error {
  constructor(
    public status: number,
    public type: string,
    message: string,
    public errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'SquarespaceAPIError';
  }
}
