import { ImageResponse } from 'next/og'

export const alt = 'BrainLab IQ 테스트'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 글로우 - 우상단 */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.14)',
            display: 'flex',
          }}
        />
        {/* 배경 글로우 - 좌하단 */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.09)',
            display: 'flex',
          }}
        />

        {/* 뇌 이모지 */}
        <div style={{ fontSize: 90, marginBottom: 20, display: 'flex' }}>🧠</div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-3px',
            marginBottom: 14,
            display: 'flex',
          }}
        >
          BrainLab
        </div>

        {/* 태그라인 */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginBottom: 52,
            display: 'flex',
          }}
        >
          5분 안에 끝나는 두뇌 자극 IQ 테스트
        </div>

        {/* 기능 뱃지 */}
        <div style={{ display: 'flex', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 999,
              padding: '14px 32px',
              color: '#c7d2fe',
              fontSize: 22,
              gap: 10,
            }}
          >
            📝 15문항
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 999,
              padding: '14px 32px',
              color: '#c7d2fe',
              fontSize: 22,
              gap: 10,
            }}
          >
            ⏱️ 문제당 15초
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 999,
              padding: '14px 32px',
              color: '#c7d2fe',
              fontSize: 22,
              gap: 10,
            }}
          >
            🏆 순위 + 예상 IQ
          </div>
        </div>

        {/* 도메인 */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 52,
            fontSize: 20,
            color: '#334155',
            display: 'flex',
          }}
        >
          brainlab.live
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
