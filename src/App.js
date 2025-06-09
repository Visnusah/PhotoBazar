import './App.css';

const unsplashImages = [
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Misty Mountains',
    desc: 'A breathtaking view of misty mountains at sunrise.',
  },
  {
    url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Forest Path',
    desc: 'A tranquil path through a lush green forest.',
  },
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    title: 'Desert Dunes',
    desc: 'Golden sand dunes under a clear blue sky.',
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    title: 'Snowy Peaks',
    desc: 'Majestic snowy mountain peaks reaching the clouds.',
  },
  {
    url: 'https://images.unsplash.com/photo-1661064941810-7a62f443fdb1?q=80&w=3348&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Serene Lake',
    desc: 'A calm lake reflecting the surrounding trees and sky.',
  },
  {
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    title: 'Sunset Over Hills',
    desc: 'A vibrant sunset casting warm hues over rolling hills.',
  },
];

function App() {
  return (
    <div className="App" style={{ fontFamily: 'sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
      <header
        style={{
          background: 'linear-gradient(90deg, #232526 0%, #414345 100%)',
          color: '#fff',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '2px' }}>PhotoBazar</h1>
        <p style={{ margin: '1rem 0 0.5rem', fontSize: '1.2rem' }}>
          Discover and buy stunning photos for your projects
        </p>
        <a
          href="#explore"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: '#ff9800',
            color: '#fff',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'background 0.2s',
          }}
        >
          Explore Photos
        </a>
      </header>
      <main style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
        <section id="explore">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', color: '#333' }}>
            Featured Photos
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Unsplash photo cards for better UX */}
            {unsplashImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                }}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', background: '#e0e0e0' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x180?text=Image+Not+Available';
                  }}
                />
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#222' }}>
                    {img.title}
                  </h3>
                  <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.95rem' }}>
                    {img.desc}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>$9.99</span>
                    <button
                      style={{
                        background: '#232526',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.5rem 1.2rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        transition: 'background 0.2s',
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem 1rem 1rem',
          background: '#232526',
          color: '#fff',
          marginTop: '2rem',
        }}
      >
        <div style={{ fontSize: '1rem' }}>
          &copy; {new Date().getFullYear()} PhotoBazar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
