"use client";

import { useState } from "react";
import { sifrePuani } from "../lib/sifre";

const ETIKETLER = ["", "Çok zayıf", "Zayıf", "İyi", "Güçlü"];
const RENKLER = ["", "#ef5a6f", "#f0a63c", "#4fa8de", "#5fbf8b"];

export default function SifreAlani({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
  gucGoster = false,
  ipucu,
}) {
  const [gorunur, setGorunur] = useState(false);
  const puan = sifrePuani(value);

  return (
    <div className="alan">
      <label htmlFor={id}>{label}</label>

      <div className="sifre-sar">
        <input
          id={id}
          type={gorunur ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="sifre-goz"
          onClick={() => setGorunur((v) => !v)}
          aria-label={gorunur ? "Şifreyi gizle" : "Şifreyi göster"}
          tabIndex={-1}
        >
          {gorunur ? "🙈" : "👁"}
        </button>
      </div>

      {gucGoster && value && (
        <div className="guc">
          <div className="guc-cubuklar">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="guc-parca"
                style={{ background: i <= puan ? RENKLER[puan] : "var(--line)" }}
              />
            ))}
          </div>
          <span className="guc-etiket" style={{ color: RENKLER[puan] }}>
            {ETIKETLER[puan]}
          </span>
        </div>
      )}

      {ipucu && <p className="ipucu">{ipucu}</p>}
    </div>
  );
}
