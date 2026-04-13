"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api"

export interface AppSettings {
  id: number
  business_name: str
  slogan: string
  rif: string
  phone: string
  address: string
  email: string
  primary_color: string
  accent_color: string
  heading_font: string
  body_font: string
  logo_url: string
}

interface SettingsContextType {
  settings: AppSettings | null
  loading: boolean
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiFetch<AppSettings>("/settings", { auth: false })
      setSettings(data)
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await apiFetch<AppSettings>("/settings", {
        method: "PATCH",
        body: JSON.stringify(newSettings)
      })
      setSettings(updated)
    } catch (error) {
       console.error("Error updating settings:", error)
       throw error
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      <DynamicTheme settings={settings} />
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Componente que inyecta variables CSS y fuentes dinámicas en el DOM.
 */
function DynamicTheme({ settings }: { settings: AppSettings | null }) {
  useEffect(() => {
    if (settings && typeof window !== "undefined") {
      document.title = settings.business_name
    }
  }, [settings])

  if (!settings) return null

  // Mapeo básico de nombres de fuentes a familias de Google Fonts
  // En una versión más pro, podríamos traer estos enlaces del backend también
  const fontImport = `
    @import url('https://fonts.googleapis.com/css2?family=${settings.heading_font.replace(/ /g, '+')}&family=${settings.body_font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap');
    
    :root {
      --primary: ${settings.primary_color};
      --accent: ${settings.accent_color};
      --font-heading: '${settings.heading_font}', cursive;
      --font-sans: '${settings.body_font}', sans-serif;
    }
    
    /* Forzamos el uso de la fuente del cuerpo si no está en Tailwind */
    body {
       font-family: var(--font-sans);
    }
    h1, h2, h3, h4, h5, h6, .font-heading {
       font-family: var(--font-heading);
    }
  `

  return (
    <style dangerouslySetInnerHTML={{ __html: fontImport }} />
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
