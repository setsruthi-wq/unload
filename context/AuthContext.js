import React, { createContext, useContext, useState } from 'react';
import { mockChildData, mockParentData } from '../data/mockData';

const AuthContext = createContext();

/**
 * Derive a display-friendly first name from a full name string.
 * e.g. "Sarah Jenkins" → "Sarah"
 */
const firstNameOf = (fullName) => (fullName || '').trim().split(' ')[0] || fullName;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // 'child' | 'parent'
  const [user, setUser] = useState(null);

  /**
   * login — called from LoginScreen.
   * Accepts the name the user typed; if blank, falls back to mock defaults.
   */
  const login = (email, password, selectedRole = 'child', userName = '') => {
    setRole(selectedRole);
    const resolvedName = userName.trim()
      ? userName.trim()
      : selectedRole === 'child' ? mockChildData.name : mockParentData.name;

    setUser({
      name: resolvedName,
      firstName: firstNameOf(resolvedName),
      email: email || (selectedRole === 'child' ? 'leo.j@safesprout.org' : mockParentData.email),
      role: selectedRole,
      avatar: selectedRole === 'child' ? mockChildData.avatar : mockParentData.avatar,
    });
    setIsAuthenticated(true);
  };

  /**
   * loginAsDemo — one-tap demo login (keeps mock names)
   */
  const loginAsDemo = (demoRole) => {
    if (demoRole === 'child') {
      setRole('child');
      setUser({
        name: mockChildData.name,
        firstName: firstNameOf(mockChildData.name),
        email: 'leo.j@safesprout.org',
        role: 'child',
        avatar: mockChildData.avatar,
      });
    } else {
      setRole('parent');
      setUser({
        name: mockParentData.name,
        firstName: firstNameOf(mockParentData.name),
        email: mockParentData.email,
        role: 'parent',
        avatar: mockParentData.avatar,
      });
    }
    setIsAuthenticated(true);
  };

  /**
   * register — called from RegisterScreen with { name, email, role }
   * Uses name from user input; validates it is non-empty.
   */
  const register = (userData) => {
    const assignedRole = userData.role || 'child';
    const resolvedName = (userData.name || '').trim()
      || (assignedRole === 'child' ? mockChildData.name : mockParentData.name);

    setRole(assignedRole);
    setUser({
      name: resolvedName,
      firstName: firstNameOf(resolvedName),
      email: userData.email || `${resolvedName.toLowerCase().replace(/\s+/g, '.')}@safesprout.org`,
      role: assignedRole,
      avatar: assignedRole === 'child' ? '🌱' : '👩‍💼',
    });
    setIsAuthenticated(true);
  };

  /**
   * selectRole — used on RoleSelection screen (keeps current name if user already exists)
   */
  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'child') {
      setUser({
        name: mockChildData.name,
        firstName: firstNameOf(mockChildData.name),
        email: 'leo.j@safesprout.org',
        role: 'child',
        avatar: mockChildData.avatar,
      });
    } else {
      setUser({
        name: mockParentData.name,
        firstName: firstNameOf(mockParentData.name),
        email: mockParentData.email,
        role: 'parent',
        avatar: mockParentData.avatar,
      });
    }
    setIsAuthenticated(true);
  };

  /**
   * switchRole — swap between child/parent view in demo mode.
   * Preserves the actual logged-in user name for the primary role,
   * shows mock defaults for the switched-to role.
   */
  const switchRole = () => {
    const nextRole = role === 'child' ? 'parent' : 'child';
    setRole(nextRole);
    if (nextRole === 'child') {
      setUser((prev) => ({
        ...prev,
        name: mockChildData.name,
        firstName: firstNameOf(mockChildData.name),
        email: 'leo.j@safesprout.org',
        role: 'child',
        avatar: mockChildData.avatar,
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        name: mockParentData.name,
        firstName: firstNameOf(mockParentData.name),
        email: mockParentData.email,
        role: 'parent',
        avatar: mockParentData.avatar,
      }));
    }
  };

  /**
   * updateUserName — allow in-app name editing (Profile screen, future use)
   */
  const updateUserName = (newName) => {
    if (!newName || !newName.trim()) return;
    setUser((prev) => ({
      ...prev,
      name: newName.trim(),
      firstName: firstNameOf(newName.trim()),
    }));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        user,
        login,
        loginAsDemo,
        register,
        selectRole,
        switchRole,
        updateUserName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
