// src/lib/icon-utils.ts
import type React from 'react';
import { Info } from 'lucide-react';

/**
 * Dynamically imports a Lucide icon by name.
 * Returns the Info icon as a fallback if the specified icon is not found.
 *
 * @param iconName The name of the Lucide icon to import (e.g., "Home", "Users").
 * @returns A promise that resolves to the icon component or the Info icon component.
 */
export const importLucideIcon = async (iconName: string | undefined): Promise<React.ElementType | typeof Info> => {
  if (!iconName) return Info;
  try {
    // Normalize icon name to PascalCase as Lucide exports icons this way
    const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // @ts-ignore - Dynamically importing from lucide-react
    const module = await import('lucide-react');
    // @ts-ignore - Accessing icon by potentially dynamic name
    return module[normalizedIconName] || module[iconName] || Info; // Check both normalized and original, then fallback
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    return Info; // Fallback icon
  }
};
