var PostPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var title = entry.getIn(['data', 'title'], '');
    var date = entry.getIn(['data', 'date'], '');
    var author = entry.getIn(['data', 'author'], '');
    var excerpt = entry.getIn(['data', 'excerpt'], '');
    var body = this.props.widgetFor('body');

    return h('div', { style: { fontFamily: "'Barlow', sans-serif", background: '#0a0a0a', color: '#f5f5f0', minHeight: '100vh' } },
      // Fonts
      h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Barlow+Condensed:wght@400;500;600;700&display=swap' }),

      // Hero
      h('div', { style: { background: '#111111', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.08)' } },
        h('div', { style: { maxWidth: '780px', margin: '0 auto' } },
          h('a', { href: '/blog/', style: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888880', display: 'inline-block', marginBottom: '2rem' } }, '← Tous les articles'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.2rem', flexWrap: 'wrap' } },
            date && h('span', { style: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c8102e' } }, date),
            author && h('span', { style: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888880' } }, 'Par ' + author)
          ),
          h('h1', { style: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '0.03em', lineHeight: 1, color: '#f5f5f0', marginBottom: '1rem' } }, title.toUpperCase()),
          excerpt && h('p', { style: { fontSize: '1.1rem', color: '#888880', maxWidth: '680px', lineHeight: 1.6 } }, excerpt)
        )
      ),

      // Body
      h('div', { style: { maxWidth: '780px', margin: '0 auto', padding: '3rem 2rem' } },
        h('div', {
          style: {
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#f5f5f0'
          }
        }, body)
      )
    );
  }
});

CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Barlow+Condensed:wght@400;500;600;700&display=swap');

CMS.registerPreviewStyle('/admin/preview.css');

CMS.registerPreviewTemplate('posts', PostPreview);
