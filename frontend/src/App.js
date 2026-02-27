import { useEffect, useMemo, useState } from "react";
import "./App.css";

const getApiBaseUrl = () => {
  const envBase = (process.env.REACT_APP_API_URL || "").trim();
  if (!envBase) {
    return "/api";
  }

  const withoutTrailingSlash = envBase.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const initialCourseState = {
  courseName: "",
  courseDescription: "",
  instructor: ""
};

const initialAuthState = {
  name: "",
  email: "",
  password: ""
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("scms_token") || "");
  const [student, setStudent] = useState(
    JSON.parse(localStorage.getItem("scms_student") || "null")
  );
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState(initialAuthState);
  const [courseForm, setCourseForm] = useState(initialCourseState);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses(search);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSession = (sessionData) => {
    localStorage.setItem("scms_token", sessionData.token);
    localStorage.setItem(
      "scms_student",
      JSON.stringify({ _id: sessionData._id, name: sessionData.name, email: sessionData.email })
    );
    setToken(sessionData.token);
    setStudent({ _id: sessionData._id, name: sessionData.name, email: sessionData.email });
  };

  const clearNotifications = () => {
    setError("");
    setMessage("");
  };

  const fetchCourses = async (searchTerm = "") => {
    try {
      setLoading(true);
      clearNotifications();

      const query = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
      const response = await fetch(`${API_BASE_URL}/courses${query}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    clearNotifications();

    try {
      setLoading(true);

      const endpoint = authMode === "register" ? "register" : "login";
      const payload =
        authMode === "register"
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setSession(data);
      setAuthForm(initialAuthState);
      setMessage(authMode === "register" ? "Registration successful" : "Login successful");
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    clearNotifications();

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create course");
      }

      setCourseForm(initialCourseState);
      setMessage("Course created");
      fetchCourses(search);
    } catch (courseError) {
      setError(courseError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    clearNotifications();
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to delete course");
      }

      setMessage(data.message || "Course deleted");
      fetchCourses(search);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("scms_token");
    localStorage.removeItem("scms_student");
    setToken("");
    setStudent(null);
    setCourses([]);
    setSearch("");
    setMessage("Logged out successfully");
    setError("");
  };

  if (!isAuthenticated) {
    return (
      <main className="page">
        <section className="card auth-card">
          <h1>Student Course Management System</h1>
          <p className="subheading">{authMode === "register" ? "Register" : "Login"}</p>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <form onSubmit={handleAuthSubmit} className="form-grid">
            {authMode === "register" && (
              <input
                type="text"
                placeholder="Name"
                value={authForm.name}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : authMode === "register" ? "Register" : "Login"}
            </button>
          </form>

          <button
            className="switch-button"
            onClick={() => {
              clearNotifications();
              setAuthMode((prev) => (prev === "register" ? "login" : "register"));
            }}
          >
            {authMode === "register"
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1>Courses Dashboard</h1>
            <p className="subheading">Welcome, {student?.name}</p>
          </div>
          <button onClick={logout} className="danger">
            Logout
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <form onSubmit={handleCourseSubmit} className="form-grid">
          <input
            type="text"
            placeholder="Course Name"
            value={courseForm.courseName}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, courseName: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Instructor"
            value={courseForm.instructor}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, instructor: e.target.value }))}
            required
          />
          <textarea
            placeholder="Course Description"
            value={courseForm.courseDescription}
            onChange={(e) =>
              setCourseForm((prev) => ({
                ...prev,
                courseDescription: e.target.value
              }))
            }
            rows={3}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Course"}
          </button>
        </form>

        <div className="search-row">
          <input
            type="text"
            placeholder="Search by course, description, or instructor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => fetchCourses(search)} disabled={loading}>
            Search
          </button>
        </div>

        <ul className="courses-list">
          {courses.length === 0 ? (
            <li className="empty-state">No courses found</li>
          ) : (
            courses.map((course) => (
              <li key={course._id} className="course-item">
                <div>
                  <h3>{course.courseName}</h3>
                  <p>{course.courseDescription}</p>
                  <small>
                    Instructor: {course.instructor} | Created:{" "}
                    {new Date(course.createdAt).toLocaleString()}
                  </small>
                </div>
                <button
                  className="danger"
                  onClick={() => handleDeleteCourse(course._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

export default App;
