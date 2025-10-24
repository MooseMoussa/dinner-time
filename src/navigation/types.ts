export type RootStackParamList = {
  Welcome: undefined;
  UserSelection: undefined;
  FaceLogin: undefined;
  ProfileSetup: undefined;
  FaceRegistration: {userId: string};
  Home: {userId: string};
  Preferences: {userId: string; profileId?: string};
  SuggestionRequest: {userId: string; profileId: string};
  SuggestionsList: {userId: string; requestId: string};
  SuggestionDetail: {suggestionId: string};
  Settings: {userId: string};
};
