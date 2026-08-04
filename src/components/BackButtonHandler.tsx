import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useLocation, useNavigate } from "react-router-dom";

const HOME_PATHS = ["/", "/login"];

export const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener("backButton", () => {
      if (HOME_PATHS.includes(location.pathname)) {
        const confirmExit = window.confirm(
          "¿Querés salir de la app?"
        );
        if (confirmExit) {
          CapacitorApp.exitApp();
        }
        return;
      }

      navigate(-1);
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [location.pathname, navigate]);

  return null;
};

export default BackButtonHandler;
