import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  generateKeyPair,
  storePrivateKey,
  getStoredPrivateKey,
  hasPrivateKey,
} from "@/lib/e2e-crypto";

/**
 * Hook to manage the current user's E2E encryption keys.
 * Automatically generates and stores keys if they don't exist.
 */
export function useEncryptionKeys() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [privateKey, setPrivateKey] = useState<JsonWebKey | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setReady(false);
      setPrivateKey(null);
      return;
    }

    const init = async () => {
      // Check if we have a private key locally
      const existingPrivate = getStoredPrivateKey(user.id);

      if (existingPrivate) {
        setPrivateKey(existingPrivate);
        setReady(true);

        // Ensure public key exists in DB
        const { data } = await supabase
          .from("user_encryption_keys")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!data) {
          // Re-derive public key from private and store it
          // For ECDH P-256, we can reconstruct the public from the JWK
          const publicJwk: JsonWebKey = {
            kty: existingPrivate.kty,
            crv: existingPrivate.crv,
            x: existingPrivate.x,
            y: existingPrivate.y,
          };
          await supabase.from("user_encryption_keys").upsert({
            user_id: user.id,
            public_key: JSON.stringify(publicJwk),
          }, { onConflict: "user_id" });
        }
        return;
      }

      // Generate new key pair
      const { publicKeyJwk, privateKeyJwk } = await generateKeyPair();
      storePrivateKey(user.id, privateKeyJwk);
      setPrivateKey(privateKeyJwk);

      // Store public key in database
      await supabase.from("user_encryption_keys").upsert({
        user_id: user.id,
        public_key: JSON.stringify(publicKeyJwk),
      }, { onConflict: "user_id" });

      setReady(true);
    };

    init();
  }, [user?.id]);

  const getRecipientPublicKey = useCallback(async (recipientId: string): Promise<JsonWebKey | null> => {
    const { data } = await supabase
      .from("user_encryption_keys")
      .select("public_key")
      .eq("user_id", recipientId)
      .maybeSingle();

    if (!data?.public_key) return null;
    try {
      return JSON.parse(data.public_key);
    } catch {
      return null;
    }
  }, []);

  return {
    ready,
    privateKey,
    hasKeys: !!privateKey,
    getRecipientPublicKey,
    hasLocalPrivateKey: user?.id ? hasPrivateKey(user.id) : false,
  };
}
