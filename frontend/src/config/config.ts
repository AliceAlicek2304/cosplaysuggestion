// Environment configuration
export const config = {
  // API Base URL - auto detect based on environment
  API_BASE_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://cosplay-suggestion.com' 
    : 'http://localhost:8080'),
    
  // S3 Configuration for production
  AWS_S3_BUCKET: 'cosplay-suggestion-files',
  AWS_S3_REGION: 'ap-southeast-2',
  
  // File storage type detection
  STORAGE_TYPE: process.env.REACT_APP_STORAGE_TYPE || (process.env.NODE_ENV === 'production' ? 's3' : 'local'),
  
  // S3 URLs
  S3_BASE_URL: `https://cosplay-suggestion-files.s3.ap-southeast-2.amazonaws.com`,
  
  // Local development URLs  
  LOCAL_AVATAR_URL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/account/avatar` : 'http://localhost:8080/api/account/avatar',
  LOCAL_BACKGROUND_URL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/background` : 'http://localhost:8080/api/background',
};
