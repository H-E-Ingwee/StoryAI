// Shared types for StoryAI frontend and backend

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type ProjectVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface ProjectListItem {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  frameCount: number;
}

export interface Project extends ProjectListItem {
  userId: string;
  slug: string;
  visibility: ProjectVisibility;
  globalStyle?: string;
  globalCharacterRefs?: string[];
  globalLocationRef?: string;
  lastAccessedAt: string;
  archivedAt?: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  globalStyle?: string;
  globalCharacterRefs?: string[];
  globalLocationRef?: string;
}

// ============================================================================
// SCENE & SCRIPT TYPES
// ============================================================================

export interface Scene {
  id: string;
  projectId: string;
  sceneNumber: number;
  title: string;
  description?: string;
  location?: string;
  timeOfDay?: string;
  mood?: string;
  characters?: string[];
  actionDescription?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ScriptFormat = 'SCREENPLAY' | 'PROSE' | 'OUTLINE' | 'COMIC_SCRIPT';
export type ParsingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface ScriptDocument {
  id: string;
  projectId: string;
  rawText: string;
  format: ScriptFormat;
  parsingStatus: ParsingStatus;
  parsingError?: string;
}

export interface UploadScriptRequest {
  format: ScriptFormat;
  text: string;
}

// ============================================================================
// FRAME & GENERATION TYPES
// ============================================================================

export type FrameStatus = 'DRAFT' | 'PROMPT_READY' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';

export interface Frame {
  id: string;
  projectId: string;
  sceneId?: string;
  frameNumber: number;
  title?: string;
  caption?: string;
  shotType?: string;
  currentPromptId?: string;
  currentAssetId?: string;
  status: FrameStatus;
  seed?: string;
  generationModel?: string;
  characterProfileIds?: string[];
  locationProfileId?: string;
  stylePresetId?: string;
  referenceImageIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFrameRequest {
  sceneId?: string;
  frameNumber: number;
  title?: string;
  caption?: string;
  shotType?: string;
}

export interface UpdateFrameRequest {
  title?: string;
  caption?: string;
  shotType?: string;
  characterProfileIds?: string[];
  locationProfileId?: string;
  stylePresetId?: string;
  referenceImageIds?: string[];
}

// ============================================================================
// PROMPT TYPES
// ============================================================================

export type PromptStatus = 'DRAFT' | 'APPROVED' | 'USED' | 'REJECTED';
export type PromptEnhancement = 'cinematic' | 'comic' | 'concept_art' | 'animation' | 'realistic' | 'cultural_grounded';

export interface PromptVersion {
  id: string;
  frameId: string;
  version: number;
  subject: string;
  environment?: string;
  composition?: string;
  lighting?: string;
  cameraAngle?: string;
  style?: string;
  mood?: string;
  continuityNotes?: string;
  fullPrompt: string;
  enhancement?: string;
  isActive: boolean;
  status: PromptStatus;
  createdAt: string;
}

export interface CreatePromptRequest {
  frameId: string;
  subject: string;
  environment?: string;
  composition?: string;
  lighting?: string;
  cameraAngle?: string;
  style?: string;
  mood?: string;
  continuityNotes?: string;
  enhancement?: PromptEnhancement;
}

export interface UpdatePromptRequest {
  subject?: string;
  environment?: string;
  composition?: string;
  lighting?: string;
  cameraAngle?: string;
  style?: string;
  mood?: string;
  continuityNotes?: string;
  fullPrompt?: string;
  status?: PromptStatus;
}

// ============================================================================
// GENERATION & ASSET TYPES
// ============================================================================

export type AssetStatus = 'PENDING' | 'GENERATED' | 'APPROVED' | 'USED' | 'REJECTED' | 'FAILED';

export interface GeneratedAsset {
  id: string;
  frameId: string;
  promptId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  seed?: string;
  generationModel?: string;
  generationTime?: number;
  status: AssetStatus;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export type GenerationJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface GenerationJob {
  id: string;
  userId: string;
  projectId: string;
  frameId: string;
  status: GenerationJobStatus;
  jobType: string;
  provider?: string;
  externalJobId?: string;
  progress: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateImageRequest {
  frameId: string;
  promptId?: string;
  seed?: string;
}

export interface GenerationResponse {
  job: GenerationJob;
  asset?: GeneratedAsset;
}

// ============================================================================
// CONSISTENCY & REFERENCE TYPES
// ============================================================================

export interface CharacterProfile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  referenceImages?: string[];
  traits?: Record<string, string>;
  isReusable: boolean;
  createdAt: string;
}

export interface LocationProfile {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  environment?: string;
  architecture?: string;
  lightingSetup?: string;
  ambience?: string;
  referenceImages?: string[];
  isReusable: boolean;
  isSystemDefault: boolean;
  createdAt: string;
}

export interface StylePreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  stylePromptPrefix: string;
  stylePromptSuffix?: string;
  isReusable: boolean;
  category?: string;
  createdAt: string;
}

export interface ReferenceImage {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  type: 'character' | 'location' | 'style' | 'mood' | 'composition';
  tags?: string[];
  createdAt: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportType = 'pdf' | 'image_sheet' | 'project_summary';
export type ExportStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ExportRecord {
  id: string;
  userId: string;
  projectId: string;
  exportType: ExportType;
  status: ExportStatus;
  fileUrl?: string;
  fileName?: string;
  frameCount: number;
  createdAt: string;
  completedAt?: string;
}

export interface CreateExportRequest {
  projectId: string;
  exportType: ExportType;
  frameIds?: string[];
  includePrompts?: boolean;
  includeNotes?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}
