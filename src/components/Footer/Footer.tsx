import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import styles from './Footer.module.css';

const offerSearches = [
  ['air fryer', 'álbum da copa', 'body splash giovanna baby', 'moto g67', 'tv 32 polegadas', 'chinelo ipanema'],
  ['liquidificador', 'figurinhas da copa', 'kit elseve', 'a07', 'tv 55 polegadas', 'chocolate lindt'],
  ['escova secadora', 'presente dia dos namorados', 'moto g17', 'a17', 'tv 65 polegadas', 'oleo paixao'],
];

const serviceLinks = ['sac 4003 4848', 'guia de segurança', 'tudo em casa', 'entregas e devoluções'];

const institutionalLinks = [
  'institucional',
  'investidores americanas sa',
  'governança corporativa',
  'lojas americanas',
  'assessoria de imprensa',
  'trabalhe conosco',
  'nossas lojas',
  'cadastro de proteção à propriedade intelectual',
  'canal de denúncias',
  'programa de afiliados',
];

const doubtLinks = [
  'dúvidas',
  'central de atendimento',
  'entregas e devoluções',
  'mapa do site',
  'processo de entrega',
  'aviso de privacidade',
  'regras do site',
  'guia de segurança',
  'termos e condições de compra e venda de produtos',
  'procon-rj',
  'verifique o código anatel',
  'cupom de desconto',
  'marketplace',
  'regras para compras internacionais',
];

const expandedServiceLinks = [
  'serviços',
  'cliente a',
  'tipos de entrega',
  'seguro roubo e furto',
  'instalação de ar condicionado',
  'garantia estendida',
  'vale presente',
];

function FooterInfoColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <section>
      <h3>{title}</h3>
      {links.map((link) => (
        <a key={link} href="#">
          {link}
        </a>
      ))}
    </section>
  );
}

export function Footer() {
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  return (
    <footer className={styles.footer}>
      <section className={styles.searches}>
        <div className={styles.container}>
          <h2>ofertas que você também precisa ver</h2>

          <div className={styles.searchGrid}>
            {offerSearches.map((row, rowIndex) =>
              row.map((term) => (
                <a key={`${term}-${rowIndex}`} href="#">
                  {term}
                </a>
              )),
            )}
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.container}>
          {serviceLinks.map((link) => (
            <a key={link} href="#">
              {link}
            </a>
          ))}
        </div>
      </section>

      {moreInfoOpen && (
        <section className={styles.moreInfoPanel} aria-label="Mais informações">
          <div className={styles.moreInfoPanelGrid}>
            <a className={styles.appBanner} href="#" aria-label="Baixar app americanas">
              <strong>americanas</strong>
              <span>só no app você aproveita ofertas exclusivas</span>
              <b>baixe agora</b>
            </a>

            <FooterInfoColumn title="institucional" links={institutionalLinks} />
            <FooterInfoColumn title="dúvidas" links={doubtLinks} />
            <FooterInfoColumn title="serviços" links={expandedServiceLinks} />
          </div>
        </section>
      )}

      <section className={styles.bottom}>
        <div className={styles.container}>
          <a className={styles.logo} href="/" aria-label="Americanas home">
            americanas
          </a>

          <button
            className={styles.moreInfo}
            type="button"
            aria-expanded={moreInfoOpen}
            aria-label={moreInfoOpen ? 'Fechar mais informações' : 'Abrir mais informações'}
            onClick={() => setMoreInfoOpen((open) => !open)}
          >
            {moreInfoOpen ? 'menos informações' : 'mais informações'}
            <ChevronDown size={16} className={moreInfoOpen ? styles.moreInfoIconOpen : undefined} />
          </button>

          <div className={styles.socials} aria-label="Redes sociais">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <path d="M17.5 6.5h.01" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z" />
                <path d="m9.75 15.02 5.5-3.02-5.5-3.02v6.04Z" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 0 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>

          <p className={styles.legal}>
            americanas s.a. / CNPJ: 00.776.574/0006-60 / Inscrição Estadual: 85.687.08-5 / Endereço Rua Sacadura Cabral, 102 - Rio de Janeiro, RJ - 20081-902
          </p>

          <a className={styles.siteMap} href="#">Mapa do site</a>
        </div>
      </section>
    </footer>
  );
}
