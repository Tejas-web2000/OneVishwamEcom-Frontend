import { useCallback } from 'react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import API from '../services/api';
import { isJwtExpired } from '../utils/tokenUtils';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  googleProvider,
  facebookProvider,
  signOut,
  sendPasswordResetEmail,
} from '../firebase/config';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken(true);

      let profileData = {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        fullName: user.displayName || 'User',
        role: 'user',
      };

      try {
        const res = await API.post(
          '/auth/sync',
          {
            firebaseUid: user.uid,
            email: user.email,
            role: 'user',
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              'X-Client-Role': 'user',
            },
          }
        );
        if (res.data?.data) {
          profileData = res.data.data;
        }
      } catch (syncErr) {
        console.warn('[Auth Sync] Backend profile sync deferred:', syncErr.response?.data || syncErr.message);
      }

      localStorage.setItem('user', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      let msg = error.response?.data?.message || error.message || 'Login failed';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        msg = 'Invalid email or password';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
      }
      return rejectWithValue(msg);
    }
  }
);
export const loginUser = loginWithEmail;

export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password, name, fullName, phoneNumber, mobile, role = 'user' }, { rejectWithValue }) => {
    try {
      const resolvedName = (name || fullName || '').trim();
      // 1. Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set Firebase displayName
      if (resolvedName) {
        try {
          await updateProfile(user, { displayName: resolvedName });
        } catch (profileErr) {
          console.warn('[Firebase] updateProfile warning:', profileErr.message);
        }
      }

      // 3. Force-fetch fresh ID token directly from created user
      const idToken = await user.getIdToken(true);

      let profileData = {
        firebaseUid: user.uid,
        email: user.email,
        name: resolvedName || user.displayName || 'User',
        fullName: resolvedName || user.displayName || 'User',
        phoneNumber: phoneNumber || mobile || '',
        mobile: phoneNumber || mobile || '',
        role: role,
      };

      // 4. Save directly to MongoDB Atlas via backend
      try {
        const res = await API.post(
          '/auth/sync',
          {
            firebaseUid: user.uid,
            email: user.email,
            name: resolvedName,
            fullName: resolvedName,
            phoneNumber: phoneNumber || mobile,
            role,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (res.data?.data) {
          profileData = res.data.data;
        }
      } catch (syncErr) {
        console.warn('[Auth Sync] Backend profile sync deferred:', syncErr.response?.data || syncErr.message);
      }

      localStorage.setItem('user', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error('Registration & MongoDB save error:', error.response?.data || error.message);
      let msg = error.response?.data?.message || error.message || 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please go to Login.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password authentication is not yet enabled in your Firebase Console. Please enable Email/Password provider in Firebase Console > Authentication > Sign-in method.';
      }
      return rejectWithValue(msg);
    }
  }
);
export const registerUser = registerWithEmail;

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const idToken = await user.getIdToken(true);

      let profileData = {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        fullName: user.displayName || 'User',
        avatar: user.photoURL || '',
        role: 'user',
      };

      try {
        const res = await API.post(
          '/auth/sync',
          {
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName,
            fullName: user.displayName,
            avatar: user.photoURL,
            role: 'user',
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              'X-Client-Role': 'user',
            },
          }
        );
        if (res.data?.data) {
          profileData = res.data.data;
        }
      } catch (syncErr) {
        console.warn('[Auth Sync] Backend profile sync deferred:', syncErr.response?.data || syncErr.message);
      }

      localStorage.setItem('user', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      let msg = error.message || 'Google sign-in failed';
      if (error.code === 'auth/unauthorized-domain') {
        msg = `Domain "${window.location.hostname}" is not authorized in Firebase Console. Please add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
      } else if (error.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in popup was closed before completing.';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        msg = 'Google sign-in is not yet enabled in your Firebase Console. Please enable Google provider in Firebase Console > Authentication > Sign-in method.';
      }
      return rejectWithValue(msg);
    }
  }
);

export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithPopup(auth, facebookProvider);
      const user = userCredential.user;
      const idToken = await user.getIdToken(true);

      let profileData = {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        fullName: user.displayName || 'User',
        avatar: user.photoURL || '',
        role: 'user',
      };

      try {
        const res = await API.post(
          '/auth/sync',
          {
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName,
            fullName: user.displayName,
            avatar: user.photoURL,
            role: 'user',
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              'X-Client-Role': 'user',
            },
          }
        );
        if (res.data?.data) {
          profileData = res.data.data;
        }
      } catch (syncErr) {
        console.warn('[Auth Sync] Backend profile sync deferred:', syncErr.response?.data || syncErr.message);
      }

      localStorage.setItem('user', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      let msg = error.message || 'Facebook sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Facebook sign-in popup was closed before completing.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        msg = 'An account already exists with the same email address using a different sign-in method.';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        msg = 'Facebook sign-in is not yet enabled in your Firebase Console. Please enable Facebook provider in Firebase Console > Authentication > Sign-in method.';
      }
      return rejectWithValue(msg);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out error:', err);
  }
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return null;
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/auth/me');
    const user = res.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (body, { rejectWithValue, dispatch }) => {
    try {
      if (auth && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }

      const currentUser = auth.currentUser;
      let idToken;

      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken(true);
          localStorage.setItem('accessToken', idToken);
        } catch (tokErr) {
          console.warn('[updateProfile] Failed to force refresh token:', tokErr);
          idToken = await currentUser.getIdToken(false);
        }
      } else {
        const storedToken = localStorage.getItem('accessToken');
        if (!storedToken || isJwtExpired(storedToken)) {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          dispatch(forceLogout());
          return rejectWithValue('Unauthorized: Firebase token has expired. Please sign in again.');
        }
        idToken = storedToken;
      }

      const resolvedName = (body.name || body.fullName || '').trim();
      // 1. If Firebase Auth has an active user and name was changed, sync Firebase displayName
      if (currentUser && resolvedName) {
        try {
          await updateProfile(currentUser, { displayName: resolvedName });
        } catch (fbErr) {
          console.warn('[Firebase] updateProfile warning:', fbErr.message);
        }
      }

      // 2. Fetch fresh token for backend authorization
      const syncPayload = {
        ...body,
        role: body?.role || 'user',
      };
      const res = await API.post('/auth/sync', syncPayload, {
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          'X-Client-Role': 'user',
        },
      });
      const user = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      const respData = err.response?.data;
      const rawError = respData?.error || respData?.message || err.message || 'Update failed';
      const errMsg = String(rawError);

      if (errMsg.toLowerCase().includes('expired') || errMsg.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        dispatch(forceLogout());
        return rejectWithValue('Unauthorized: Firebase token has expired. Please sign in again.');
      }

      if ((errMsg.includes('E11000') || errMsg.includes('duplicate key')) && !errMsg.includes('null')) {
        return rejectWithValue('This mobile number is already registered with another account. Please use a different mobile number.');
      }

      if (respData?.message && respData.message !== 'Failed to persist user in database') {
        return rejectWithValue(respData.message);
      }

      return rejectWithValue(errMsg);
    }
  }
);

export const updateUserNotifications = createAsyncThunk(
  'auth/updateNotifications',
  async (prefs, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/sync', {
        notifications: {
          email: prefs.email,
          whatsapp: prefs.whatsapp,
        },
      });
      const user = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const forgotUserPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send password reset email');
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await API.delete('/auth/account');
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

let parsedStoredUser = null;
try {
  const rawUser = localStorage.getItem('user');
  if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
    parsedStoredUser = JSON.parse(rawUser);
  } else if (rawUser === 'undefined' || rawUser === 'null') {
    localStorage.removeItem('user');
  }
} catch {
  localStorage.removeItem('user');
  parsedStoredUser = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: !!parsedStoredUser,
    user: parsedStoredUser,
    showAuthModal: false,
    authModalMode: 'login',
    loading: false,
    error: null,
    successMessage: null,
    forgotEmail: null,
    verifyToken: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.loading = false;
      state.error = null;
      if (action.payload && typeof action.payload === 'object') {
        try {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } catch {
          /* storage error */
        }
      } else {
        localStorage.removeItem('user');
      }
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.loading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    openAuthModal(state, action) {
      state.showAuthModal = true;
      state.authModalMode = action.payload || 'login';
      state.error = null;
      state.successMessage = null;
      state.forgotEmail = null;
      state.verifyToken = null;
    },
    closeAuthModal(state) {
      state.showAuthModal = false;
      state.error = null;
      state.successMessage = null;
      state.forgotEmail = null;
      state.verifyToken = null;
    },
    switchAuthMode(state, action) {
      state.authModalMode = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    setForgotEmail(state, action) {
      state.forgotEmail = action.payload;
    },
    setVerifyToken(state, action) {
      state.verifyToken = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.successMessage = null;
    },
    forceLogout(state) {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Login with Email
      .addCase(loginWithEmail.pending, handlePending)
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.successMessage = 'Login successful!';
      })
      .addCase(loginWithEmail.rejected, handleRejected)

      // Register with Email
      .addCase(registerWithEmail.pending, handlePending)
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.successMessage = 'Account created successfully!';
      })
      .addCase(registerWithEmail.rejected, handleRejected)

      // Google Login
      .addCase(loginWithGoogle.pending, handlePending)
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.successMessage = 'Signed in with Google!';
        const hasPhone = Boolean(action.payload?.phoneNumber || action.payload?.mobile || action.payload?.phone);
        if (!hasPhone) {
          state.showAuthModal = true;
          state.authModalMode = 'require-phone';
        }
      })
      .addCase(loginWithGoogle.rejected, handleRejected)

      // Facebook Login
      .addCase(loginWithFacebook.pending, handlePending)
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.successMessage = 'Signed in with Facebook!';
        const hasPhone = Boolean(action.payload?.phoneNumber || action.payload?.mobile || action.payload?.phone);
        if (!hasPhone) {
          state.showAuthModal = true;
          state.authModalMode = 'require-phone';
        }
      })
      .addCase(loginWithFacebook.rejected, handleRejected)

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
      })

      // Fetch Me
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
        const hasPhone = Boolean(action.payload?.phoneNumber || action.payload?.mobile || action.payload?.phone);
        if (hasPhone && state.authModalMode === 'require-phone') {
          state.showAuthModal = false;
        }
      })
      .addCase(fetchMe.rejected, (state) => {
        // If session expired
        state.isLoggedIn = false;
        state.user = null;
      })

      // Profile Update
      .addCase(updateUserProfile.pending, handlePending)
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Profile updated successfully';
        const hasPhone = Boolean(action.payload?.phoneNumber || action.payload?.mobile || action.payload?.phone);
        if (hasPhone && state.authModalMode === 'require-phone') {
          state.showAuthModal = false;
        }
      })
      .addCase(updateUserProfile.rejected, handleRejected)

      // Forgot Password
      .addCase(forgotUserPassword.pending, handlePending)
      .addCase(forgotUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Password reset instructions sent to your email';
      })
      .addCase(forgotUserPassword.rejected, handleRejected)

      // Delete Account
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
      });
  },
});

export const {
  setUser,
  logout,
  openAuthModal,
  closeAuthModal,
  switchAuthMode,
  clearError,
  clearSuccess,
  forceLogout,
  setForgotEmail,
  setVerifyToken,
} = authSlice.actions;

export default authSlice.reducer;

export function useAuth() {
  const dispatch = useDispatch();
  return {
    isLoggedIn: useSelector((s) => s.auth.isLoggedIn),
    user: useSelector((s) => s.auth.user),
    showAuthModal: useSelector((s) => s.auth.showAuthModal),
    authModalMode: useSelector((s) => s.auth.authModalMode),
    loading: useSelector((s) => s.auth.loading),
    error: useSelector((s) => s.auth.error),
    successMessage: useSelector((s) => s.auth.successMessage),
    forgotEmail: useSelector((s) => s.auth.forgotEmail),
    verifyToken: useSelector((s) => s.auth.verifyToken),
    login: useCallback((credentials) => dispatch(loginWithEmail(credentials)), [dispatch]),
    loginWithEmail: useCallback((credentials) => dispatch(loginWithEmail(credentials)), [dispatch]),
    loginWithGoogle: useCallback(() => dispatch(loginWithGoogle()), [dispatch]),
    loginWithFacebook: useCallback(() => dispatch(loginWithFacebook()), [dispatch]),
    register: useCallback((userData) => dispatch(registerWithEmail(userData)), [dispatch]),
    registerWithEmail: useCallback((userData) => dispatch(registerWithEmail(userData)), [dispatch]),
    logout: useCallback(() => dispatch(logoutUser()), [dispatch]),
    openAuthModal: useCallback((mode) => dispatch(openAuthModal(mode)), [dispatch]),
    closeAuthModal: useCallback(() => dispatch(closeAuthModal()), [dispatch]),
    switchAuthMode: useCallback((mode) => dispatch(switchAuthMode(mode)), [dispatch]),
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
    clearSuccess: useCallback(() => dispatch(clearSuccess()), [dispatch]),
    fetchMe: useCallback(() => dispatch(fetchMe()), [dispatch]),
    updateProfile: useCallback((body) => dispatch(updateUserProfile(body)), [dispatch]),
    updateNotifications: useCallback((prefs) => dispatch(updateUserNotifications(prefs)), [dispatch]),
    forgotPassword: useCallback((email) => dispatch(forgotUserPassword(email)), [dispatch]),
    deleteAccount: useCallback(() => dispatch(deleteUserAccount()), [dispatch]),
    forceLogout: useCallback(() => dispatch(forceLogout()), [dispatch]),
    setForgotEmail: useCallback((email) => dispatch(setForgotEmail(email)), [dispatch]),
    setVerifyToken: useCallback((token) => dispatch(setVerifyToken(token)), [dispatch]),
  };
}
