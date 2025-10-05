/* eslint-disable no-unused-vars */
import React from "react";

console.log("🟢 ErrorBoundary.jsx file loaded!");

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    console.log("🟡 ErrorBoundary constructor called");
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    console.log("🔴 getDerivedStateFromError called:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Error caught by boundary:", error, errorInfo);
    this.setState({ error: error });
  }

  handleReset = () => {
    console.log("🔄 Reset clicked");
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  handleReload = () => {
    console.log("↻ Reload clicked");
    window.location.reload();
  };

  render() {
    console.log("🎨 ErrorBoundary render, hasError:", this.state.hasError);

    if (this.state.hasError) {
      console.log("⚠️ Showing error screen");
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <div style={styles.icon}>⚠️</div>
              <h1 style={styles.title}>Oops! Something went wrong</h1>
              <p style={styles.subtitle}>
                We encountered an unexpected error. Don't worry, your data is
                safe.
              </p>
            </div>

            {this.state.error && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{this.state.error.toString()}</p>
              </div>
            )}

            <div style={styles.buttonContainer}>
              <button onClick={this.handleReset} style={styles.primaryButton}>
                🔄 Return to Home
              </button>

              <button
                onClick={this.handleReload}
                style={styles.secondaryButton}
              >
                ↻ Reload Page
              </button>
            </div>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      );
    }

    console.log("✅ Rendering children");
    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    maxWidth: "448px",
    width: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  icon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
    marginTop: 0,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    maxHeight: "150px",
    overflow: "auto",
  },
  errorText: {
    fontSize: "14px",
    fontFamily: "Monaco, Consolas, monospace",
    color: "#991b1b",
    wordBreak: "break-all",
    margin: 0,
    lineHeight: "1.5",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  },
};

export default ErrorBoundary;
