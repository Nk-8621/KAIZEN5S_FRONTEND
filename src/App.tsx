import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { AppShell } from "@/components/layout/AppShell"
import { RequireAuth } from "@/components/layout/RequireAuth"
import { LoginPage } from "@/pages/auth/LoginPage"

import { KaizenListPage } from "@/pages/kaizen/KaizenListPage"
import { KaizenDashboardPage } from "@/pages/kaizen/KaizenDashboardPage"
import { KaizenFormPage } from "@/pages/kaizen/KaizenFormPage"
import { KaizenDetailPage } from "@/pages/kaizen/KaizenDetailPage"

import { QuestionnaireListPage } from "@/pages/fiveS/QuestionnaireListPage"
import { QuestionnaireFormPage } from "@/pages/fiveS/QuestionnaireFormPage"
import { AuditInstanceListPage } from "@/pages/fiveS/AuditInstanceListPage"
import { AuditInstanceDetailPage } from "@/pages/fiveS/AuditInstanceDetailPage"
import { FiveSDashboardPage } from "@/pages/fiveS/FiveSDashboardPage"

import { IncidentListPage } from "@/pages/incidents/IncidentListPage"
import { IncidentFormPage } from "@/pages/incidents/IncidentFormPage"
import { IncidentDetailPage } from "@/pages/incidents/IncidentDetailPage"
import { IncidentDashboardPage } from "@/pages/incidents/IncidentDashboardPage"

import { ObservationListPage } from "@/pages/observations/ObservationListPage"
import { ObservationFormPage } from "@/pages/observations/ObservationFormPage"
import { ObservationDetailPage } from "@/pages/observations/ObservationDetailPage"
import { ObservationDashboardPage } from "@/pages/observations/ObservationDashboardPage"

import { AssessmentFormListPage } from "@/pages/assessments/AssessmentFormListPage"
import { AssessmentFormBuilderPage } from "@/pages/assessments/AssessmentFormBuilderPage"
import { AssessmentSubmitPage } from "@/pages/assessments/AssessmentSubmitPage"
import { AssessmentSubmissionListPage } from "@/pages/assessments/AssessmentSubmissionListPage"
import { AssessmentSubmissionDetailPage } from "@/pages/assessments/AssessmentSubmissionDetailPage"
import { AssessmentDashboardPage } from "@/pages/assessments/AssessmentDashboardPage"

import { SettingsPage } from "@/pages/settings/SettingsPage"

/**
 * The full route tree for all 5 modules, per ANALYSIS.md §9's target frontend architecture.
 * Every module route lives under RequireAuth + the shared AppShell (left sidebar + topbar);
 * only /login sits outside that shell.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/kaizen" replace />} />

              <Route path="/kaizen" element={<KaizenListPage />} />
              <Route path="/kaizen/dashboard" element={<KaizenDashboardPage />} />
              <Route path="/kaizen/new" element={<KaizenFormPage />} />
              <Route path="/kaizen/:id" element={<KaizenDetailPage />} />
              <Route path="/kaizen/:id/edit" element={<KaizenFormPage />} />

              <Route path="/five-s" element={<QuestionnaireListPage />} />
              <Route path="/five-s/questionnaires/new" element={<QuestionnaireFormPage />} />
              <Route path="/five-s/questionnaires/:id" element={<QuestionnaireFormPage />} />
              <Route path="/five-s/audits" element={<AuditInstanceListPage />} />
              <Route path="/five-s/audits/:id" element={<AuditInstanceDetailPage />} />
              <Route path="/five-s/dashboard" element={<FiveSDashboardPage />} />

              <Route path="/incidents" element={<IncidentListPage />} />
              <Route path="/incidents/new" element={<IncidentFormPage />} />
              <Route path="/incidents/dashboard" element={<IncidentDashboardPage />} />
              <Route path="/incidents/:id" element={<IncidentDetailPage />} />

              <Route path="/observations" element={<ObservationListPage />} />
              <Route path="/observations/new" element={<ObservationFormPage />} />
              <Route path="/observations/dashboard" element={<ObservationDashboardPage />} />
              <Route path="/observations/:id" element={<ObservationDetailPage />} />

              <Route path="/assessments" element={<AssessmentFormListPage />} />
              <Route path="/assessments/forms/new" element={<AssessmentFormBuilderPage />} />
              <Route path="/assessments/forms/:id/submit" element={<AssessmentSubmitPage />} />
              <Route path="/assessments/submissions" element={<AssessmentSubmissionListPage />} />
              <Route path="/assessments/submissions/:id" element={<AssessmentSubmissionDetailPage />} />
              <Route path="/assessments/dashboard" element={<AssessmentDashboardPage />} />

              <Route path="/settings" element={<SettingsPage />} />

              <Route path="*" element={<Navigate to="/kaizen" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
