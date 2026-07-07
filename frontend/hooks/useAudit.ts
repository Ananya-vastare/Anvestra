"use client";

import { useState, useCallback, ChangeEvent } from "react";

// ─────────────────────────── Types ───────────────────────────

export interface LayerReport {
  score: number;
  risks: string[];
  insights: string[];
}

export interface Improvement {
  title: string;
  priority: "High" | "Medium" | "Low";
  fix: string;
}

export interface AuditResults {
  overall_score: number;
  executive_summary: string;
  usability_layer: LayerReport;
  performance_layer: LayerReport;
  behavior_layer: LayerReport;
  functional_layer: LayerReport;
  strengths: string[];
  critical_issues: string[];
  improvements: Improvement[];
}

interface AuditState {
  inputValue: string;
  selectedImage: File | null;
  imagePreview: string | null;
  goal: string;
  story: string;
  aim: string;
  isAnalyzing: boolean;
  error: string | null;
  results: AuditResults | null;
}

// ─────────────────────────── Hook ───────────────────────────

export function useAudit() {
  const [state, setState] = useState<AuditState>({
    inputValue: "",
    selectedImage: null,
    imagePreview: null,
    goal: "",
    story: "",
    aim: "",
    isAnalyzing: false,
    error: null,
    results: null,
  });

  // Handle text input changes
  const handleInputChange = useCallback(
    (field: keyof Pick<AuditState, "inputValue" | "goal" | "story" | "aim">, value: string) => {
      setState((prev) => ({
        ...prev,
        [field]: value,
        error: null,
      }));
    },
    []
  );

  // Handle image upload
  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setState((prev) => ({
        ...prev,
        error: "Please upload a valid image file.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setState((prev) => ({
        ...prev,
        selectedImage: file,
        imagePreview: reader.result as string,
        error: null,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Clear image
  const clearImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedImage: null,
      imagePreview: null,
    }));
  }, []);

  // Reset results
  const resetResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      results: null,
      error: null,
      isAnalyzing: false,
    }));
  }, []);

  // Start audit
  const startAudit = useCallback(async () => {
    // Get current state
    const currentState = state;

    // Validate
    if (!currentState.inputValue && !currentState.selectedImage) {
      setState((prev) => ({
        ...prev,
        error: "Please provide a URL or an image to audit.",
      }));
      return;
    }

    // Set loading
    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      results: null,
    }));

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append("url", currentState.inputValue);
      if (currentState.selectedImage) {
        formData.append("image", currentState.selectedImage);
      }
      formData.append("goal", currentState.goal);
      formData.append("story", currentState.story);
      formData.append("aim", currentState.aim);

      console.log("📤 Starting audit...", {
        url: currentState.inputValue,
        hasImage: !!currentState.selectedImage,
        goal: currentState.goal,
        story: currentState.story,
        aim: currentState.aim,
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for complex audits

      // Call backend directly to bypass proxy timeouts
      // const response = await fetch("https://nuvia-backend.onrender.com/audit", {
      const response = await fetch("https://localhost:5000/audit", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📥 Response received from backend:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error: ${response.status}`
        );
      }

      const data: AuditResults = await response.json();

      console.log("✅ Audit complete:", data);

      setState((prev) => ({
        ...prev,
        results: data,
        isAnalyzing: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";

      console.error("❌ Audit error:", message);

      setState((prev) => ({
        ...prev,
        error: message,
        isAnalyzing: false,
        results: null,
      }));
    }
  }, [state]);

  return {
    inputValue: state.inputValue,
    imagePreview: state.imagePreview,
    goal: state.goal,
    story: state.story,
    aim: state.aim,
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    results: state.results,
    handleInputChange,
    handleImageUpload,
    clearImage,
    resetResults,
    startAudit,
  };
}