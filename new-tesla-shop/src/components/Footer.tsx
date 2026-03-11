const Footer = () => {
  return (
    <footer style={{ 
      marginTop: '4rem', 
      padding: '3rem 0', 
      background: 'var(--dark-navy)', 
      color: '#ccc', 
      textAlign: 'center', 
      fontSize: '0.9rem' 
    }}>
      <div className="container">
        <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>TESLA PARTS UA</p>
        <p>&copy; {new Date().getFullYear()} Усі права захищено.</p>
        <p style={{ marginTop: '0.5rem' }}>Доставка по всій Україні через Нову Пошту</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
          <span>Kyiv, Ukraine</span>
          <span>+38 (0XX) XXX-XX-XX</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
