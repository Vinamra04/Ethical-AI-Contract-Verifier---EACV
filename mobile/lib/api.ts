import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export interface AnalysisResult {
  id: string;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: 'safe' | 'caution' | 'risky';
  clause_results: { clause: string; risk: string; dark_patterns: string[] }[];
  dark_patterns_detected: string[];
  highlighted_clauses: string[];
  issues: string[];
  explanation: string;
}

export interface HistoryItem {
  id: string;
  input_type: string;
  source_label: string;
  risk_level: string;
  recommendation: string;
  created_at: string;
}

export const api = {
  async analyzeText(text: string): Promise<AnalysisResult> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/analyze/text`, {
      method: 'POST', headers, body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed');
    return res.json();
  },

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/analyze/url`, {
      method: 'POST', headers, body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed');
    return res.json();
  },

  async analyzeFile(uri: string, filename: string): Promise<AnalysisResult> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const form = new FormData();
    form.append('file', { uri, name: filename, type: 'application/pdf' } as any);
    const res = await fetch(`${BASE_URL}/analyze/file`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed');
    return res.json();
  },

  async analyzeImage(uri: string, filename: string): Promise<AnalysisResult> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const form = new FormData();
    form.append('image', { uri, name: filename, type: 'image/jpeg' } as any);
    const res = await fetch(`${BASE_URL}/analyze/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed');
    return res.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/history`, { headers });
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/history/${id}`, { headers });
    if (!res.ok) throw new Error('Analysis not found');
    const data = await res.json();
    return data.result_json;
  },

  async deleteAnalysis(id: string): Promise<void> {
    const headers = await authHeaders();
    await fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE', headers });
  },

  async deleteAccount(): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/account`, { method: 'DELETE', headers });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { detail?: string }).detail || 'Failed to delete account');
    }
  },
};
