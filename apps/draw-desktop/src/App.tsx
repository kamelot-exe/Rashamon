import { invoke } from '@tauri-apps/api/core';
import { TopBar, Sidebar, Canvas, Inspector, StatusBar } from '@rashamon/ui';
import { useEffect, useState } from 'react';

/**
 * Main application shell for Rashamon Draw.
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │                TopBar                        │
 * ├──────────┬───────────────────────┬───────────┤
 * │ Sidebar  │      Canvas           │ Inspector │
 * │ (tools)  │   (workspace)         │ (props)   │
 * ├──────────┴───────────────────────┴───────────┤
 * │               StatusBar                      │
 * └──────────────────────────────────────────────┘
 */
export function App() {
  const [coreInfo, setCoreInfo] = useState<string>('loading...');

  useEffect(() => {
    invoke<string>('get_core_info')
      .then((info) => {
        try {
          const parsed = JSON.parse(info);
          setCoreInfo(
            `Core: ${parsed.name} v${parsed.version} [${parsed.features.join(', ')}]`
          );
        } catch {
          setCoreInfo(info);
        }
      })
      .catch((err) => {
        setCoreInfo(`Core: dev mode (${err})`);
      });
  }, []);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="app-canvas">
          <div className="app-canvas__content">
            <Canvas />
            <div className="app-canvas__debug">
              <code>{coreInfo}</code>
            </div>
          </div>
        </main>
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}
