import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './modules/layout/views/AppLayout';
import QuestionsView from './modules/questions/views/QuestionsView';
import ExamsView from './modules/exams/views/ExamsView';
import GradingView from './modules/grading/views/GradingView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/questions" replace />} />
          <Route path="/questions" element={<QuestionsView />} />
          <Route path="/exams" element={<ExamsView />} />
          <Route path="/grading" element={<GradingView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
