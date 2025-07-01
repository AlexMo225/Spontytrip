// Fichier d'export pour les composants SpontyTrip

export { default as ActivityFeed } from "./ActivityFeed";
export { AddExpenseForm } from "./AddExpenseForm";
export { default as AuthTest } from "./AuthTest";
export { Avatar } from "./Avatar";
export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { default as ChecklistCelebration } from "./ChecklistCelebration";
export { default as CurrencyConverterModal } from "./CurrencyConverterModal";
// 🚫 ANCIEN COMPOSANT - Remplacé par la nouvelle architecture ExpensesList + ModernExpenseCard
// export { default as ExpenseItem } from "./ExpenseItem";
export { ExpensesList } from "./ExpensesList";
export { ExpensesSummaryHeader } from "./ExpensesSummaryHeader";
export { SettlementsSection } from "./SettlementsSection";
export { default as SpontyModal } from "./SpontyModal";
export { default as SpontyTripLogoAnimated } from "./SpontyTripLogoAnimated";
// 🚫 ANCIEN COMPOSANT - Remplacé par SettlementsSection (nouvelle architecture Splitwise)
// export { default as TripBalanceSummary } from "./TripBalanceSummary";

// 🏠 HOME COMPONENTS (refactorisés)
export * from "./home";

// ✅ CHECKLIST COMPONENTS (refactorisés)
export * from "./checklist";

// 🎯 ACTIVITIES COMPONENTS (refactorisés)
export * from "./activities";

// 🗺️ TRIP DETAILS COMPONENTS (refactorisés)
export * from "./tripDetails";

export * from "./createTrip";
