"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  en: {
    translation: {
      account: {
        logout: "Logout",
        role: "Super Admin",
        settings: "Settings",
      },
      actions: {
        addAgent: "+ Add Agent",
        addClient: "+ Add Client",
        cancel: "Cancel",
        createAgent: "Create agent",
        createClient: "Create client",
        creating: "Creating...",
        filter: "Filter",
        importFile: "Upload import",
        importing: "Uploading...",
        save: "Save",
        showLatestMonths: "Show latest 6 months",
      },
      auth: {
        forgotPassword: "Forgot password?",
        password: "Password",
        phone: "Phone Number",
        resetPassword: "Reset password",
        signIn: "Sign in",
        signingIn: "Signing in...",
        subtitle: "Use your administrator phone number and password.",
        title: "Sign in",
        welcome: "Welcome back.",
      },
      common: {
        address: "Address",
        amount: "Amount",
        date: "Date",
        language: "Language",
        loading: "Loading...",
        noData: "No data yet",
        or: "Or",
        phone: "Phone",
        status: "Status",
      },
      dashboard: {
        monthlyRevenue: "Monthly Revenue",
        range: "Revenue range",
      },
      imports: {
        bulk: "Bulk import",
        csvOnly: "CSV and XLSX only. CSV files can be previewed before upload.",
        csvTemplate: "CSV template",
        drop: "Upload",
        exampleCsv: "Example CSV",
        previewing: "Previewing {{visible}} of {{total}} rows",
        xlsxTemplate: "XLSX template",
      },
      modals: {
        registerAgents: "Register Agent(s)",
        registerClients: "Register Client(s)",
      },
      nav: {
        agents: "Agents",
        clients: "Clients",
        dashboard: "Dashboard",
        payment: "Payment",
        settings: "Settings",
      },
      settings: {
        changePassword: "Change password",
        currentPassword: "Current password",
        newPassword: "New password",
        otpCode: "OTP code",
        profile: "Profile",
        requestOtp: "Request OTP",
        title: "Settings",
      },
    },
  },
  fr: {
    translation: {
      account: {
        logout: "Se deconnecter",
        role: "Super Admin",
        settings: "Parametres",
      },
      actions: {
        addAgent: "+ Ajouter agent",
        addClient: "+ Ajouter client",
        cancel: "Annuler",
        createAgent: "Enregistrer agent",
        createClient: "Enregistrer client",
        creating: "Creation...",
        filter: "Filtrer",
        importFile: "Importer le fichier",
        importing: "Importation...",
        save: "Enregistrer",
        showLatestMonths: "Afficher les 6 derniers mois",
      },
      auth: {
        forgotPassword: "Mot de passe oublie ?",
        password: "Mot de passe",
        phone: "Telephone",
        resetPassword: "Reinitialiser le mot de passe",
        signIn: "Se connecter",
        signingIn: "Connexion...",
        subtitle: "Utilisez votre telephone administrateur et votre mot de passe.",
        title: "Connexion",
        welcome: "Bienvenue.",
      },
      common: {
        address: "Adresse",
        amount: "Montant",
        date: "Date",
        language: "Langue",
        loading: "Chargement...",
        noData: "Aucune donnee",
        or: "Ou",
        phone: "Telephone",
        status: "Statut",
      },
      dashboard: {
        monthlyRevenue: "Revenu mensuel",
        range: "Periode du revenu",
      },
      imports: {
        bulk: "Import en masse",
        csvOnly: "CSV et XLSX uniquement. Les fichiers CSV peuvent etre verifies avant l'envoi.",
        csvTemplate: "Template CSV",
        drop: "Importer",
        exampleCsv: "Exemple CSV",
        previewing: "Apercu de {{visible}} sur {{total}} lignes",
        xlsxTemplate: "Template XLSX",
      },
      modals: {
        registerAgents: "Enregistrer Agent(s)",
        registerClients: "Enregistrer Client(s)",
      },
      nav: {
        agents: "Agents",
        clients: "Clients",
        dashboard: "Tableau de bord",
        payment: "Paiement",
        settings: "Parametres",
      },
      settings: {
        changePassword: "Changer le mot de passe",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        otpCode: "Code OTP",
        profile: "Profil",
        requestOtp: "Demander OTP",
        title: "Parametres",
      },
    },
  },
} as const;

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
    lng: "fr",
    resources,
  });
}

export default i18next;
