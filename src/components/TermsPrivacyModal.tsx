import { useState } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface TermsPrivacyModalProps {
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
}

export default function TermsPrivacyModal({ initialTab = 'terms', onClose }: TermsPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(8, 8, 14, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 620,
        maxHeight: '85vh',
        background: 'var(--bg-elevated, #12121A)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12 }}>
            <button
              onClick={() => setActiveTab('terms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'terms' ? 'var(--accent-lime, #C8FF00)' : 'transparent',
                color: activeTab === 'terms' ? '#08080E' : 'var(--text-muted, #8A8A9E)',
                fontWeight: 700,
                fontSize: 13,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <FileText size={14} /> Termos de Uso
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'privacy' ? 'var(--accent-lime, #C8FF00)' : 'transparent',
                color: activeTab === 'privacy' ? '#08080E' : 'var(--text-muted, #8A8A9E)',
                fontWeight: 700,
                fontSize: 13,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ShieldCheck size={14} /> Privacidade (LGPD)
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '24px 32px',
          overflowY: 'auto',
          color: 'var(--text-secondary, #B5B5C3)',
          fontSize: 14,
          lineHeight: 1.7,
          fontFamily: 'var(--font-body)',
        }}>
          {activeTab === 'terms' ? (
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 20, marginTop: 0, fontFamily: 'var(--font-display)' }}>
                Termos de Uso — RYZE Hybrid Forge
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Última atualização: Agosto de 2026</p>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>1. Aceitação dos Termos</h3>
              <p>
                Ao criar uma conta ou utilizar a plataforma RYZE, você concorda expressamente com estes Termos de Uso. O aplicativo oferece programas de treinamento híbrido (musculação + corrida) gerados com inteligência artificial com embasamento científico.
              </p>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>2. Aviso de Saúde e Responsabilidade Física</h3>
              <p style={{ background: 'rgba(255,95,31,0.08)', borderLeft: '3px solid #FF5F1F', padding: '12px 16px', borderRadius: 8 }}>
                <strong>IMPORTANTE:</strong> O RYZE fornece rotinas de treinos personalizadas, mas não substitui a orientação presencial de um médico ou profissional de Educação Física habilitado. Recomendamos realizar um check-up médico antes de iniciar qualquer programa de treinos intensos.
              </p>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>3. Período de Testes (Trial) e Assinatura</h3>
              <ul>
                <li><strong>30 Dias Grátis:</strong> Todo novo usuário cadastrado com a conta Google recebe acesso total a todas as funcionalidades por 30 dias a partir da data de cadastro.</li>
                <li><strong>Assinatura mensal:</strong> Após o período de 30 dias, o valor do plano Pro é de R$9,90 por mês.</li>
                <li><strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento através do portal do usuário sem fidelidade nem multas.</li>
              </ul>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>4. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo, algoritmos de IA, design, logotipo e marca RYZE são de propriedade exclusiva da empresa. É proibido copiar, modificar ou redistribuir parte da aplicação sem autorização prévia.
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 20, marginTop: 0, fontFamily: 'var(--font-display)' }}>
                Política de Privacidade e LGPD
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Última atualização: Agosto de 2026</p>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>1. Dados Coletados</h3>
              <p>
                Respeitamos a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Coletamos apenas os dados necessários para o funcionamento do app:
              </p>
              <ul>
                <li><strong>Dados de Autenticação (Google):</strong> Nome completo, endereço de e-mail e foto de perfil.</li>
                <li><strong>Dados Físicos e Treino:</strong> Idade, peso, altura, histórico de lesões, objetivos e registros de séries executadas.</li>
              </ul>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>2. Finalidade e Uso dos Dados</h3>
              <p>
                Seus dados são utilizados estritamente para:
              </p>
              <ul>
                <li>Gerar e adaptar seus planos de treino individualizados usando Inteligência Artificial;</li>
                <li>Calcular seu progresso, carga e sobrecarga progressiva;</li>
                <li>Gerenciar o status de sua assinatura e trial de 30 dias de forma segura.</li>
              </ul>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>3. Compartilhamento e Segurança</h3>
              <p>
                <strong>Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing.</strong> Os dados são armazenados de forma criptografada na infraestrutura em nuvem segura do Supabase.
              </p>

              <h3 style={{ color: 'var(--accent-lime)', fontSize: 15, marginTop: 20 }}>4. Seus Direitos (LGPD)</h3>
              <p>
                Você tem o direito de solicitar a exportação ou a exclusão definitiva de sua conta e de todos os seus dados a qualquer momento dentro do aplicativo ou contatando o suporte.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--accent-lime, #C8FF00)',
              color: '#08080E',
              fontWeight: 800,
              fontSize: 13,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
