import React, { useState } from "react";
import { client } from "@/services/client";
import { Text, View, Button, ScrollView, ActivityIndicator } from "react-native";
import { DeckCard } from "@/components/DeckCard";

type Card = {
  code: string;
  image: string;
  value: string;
  suit: string;
};

type DrawCardResponse = {
  success: boolean;
  deck_id: string;
  cards: Card[];
  remaining: number;
};

const getCardValue = (value: string): number => {
  if (["JACK", "QUEEN", "KING"].includes(value)) return 10;
  if (value === "ACE") return 11;
  return parseInt(value);
};

export default function Index() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cardSum, setCardSum] = useState<number>(0); // suma total de cartas
  const [remainingCards, setRemainingCards] = useState<number | null>(null);


  const handleDrawCard = async () => {
    try {
      setLoading(true);

      const res = await client.api.decks.$post({
        json: {
          deck_count: 1,
        },
      });

      const json = await res.json();

      if (res.ok && "id" in json) {
        console.log("Deck creado con ID:", json.id);
        setDeckId(json.id); 
        setHasStarted(true);
      } else {
        console.error("Error en la respuesta:", json);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawSingleCard = async () => {
    if (!deckId) {
      console.warn("No hay deck creado todavía");
      return;
    }

    try {
      setLoading(true);

      const res = await client.api.decks[":deck_id"].draw.$patch({
        param: { deck_id: deckId },
      });

      const json = (await res.json()) as Partial<DrawCardResponse>;

      if (res.ok && json.success && json.cards && json.cards.length > 0) {
        const newCard = json.cards[0];
        const value = getCardValue(newCard.value);

        setCards(prev => [...prev, newCard]);
        setCardSum(prev => {
          const newSum = prev + value;

          if (newSum === 21) {
            setTimeout(() => {
              alert("🎉 ¡Ganaste!");
              setCards([]);
              setCardSum(0);
            }, 1000);
          } else if (newSum > 21) {
            setTimeout(() => {
              alert("Perdiste. Te pasaste de 21.");
              setCards([]);
              setCardSum(0);
            }, 1000);
          }

          return newSum;
        });

        if (typeof json.remaining === "number") {
          setRemainingCards(json.remaining);
        }

      } else {
        console.error("Respuesta inesperada:", json);
      }

    } catch (error) {
      console.error("Error al robar carta:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a4e1e",
        paddingTop: 60,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!hasStarted && !loading && (
        <Button title="Iniciar Juego" onPress={handleDrawCard} />
      )}

      {loading && <ActivityIndicator size="large" color="#ffffff" />}

      {hasStarted && !loading && (
        <>
          <View
            style={{
              backgroundColor: "#1c6e2e",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              width: "100%",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5, 
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              🎮 CÓDIGO DE JUEGO:
            </Text>
            <Text
              style={{
                color: "#d4edda",
                fontSize: 16,
                marginBottom: 16,
              }}
            >
              {deckId}
            </Text>

            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              🃏 Suma de las cartas:
            </Text>
            <Text
              style={{
                color: "#d4edda",
                fontSize: 16,
                marginBottom: 16,
              }}
            >
              {cardSum}
            </Text>

            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              📦 Cartas restantes en el mazo:
            </Text>
            <Text
              style={{
                color: "#d4edda",
                fontSize: 16,
              }}
            >
              {remainingCards ?? "52"}
            </Text>

            <Button title="Robar carta" onPress={handleDrawSingleCard} disabled={loading} />

            <ScrollView
              horizontal

              contentContainerStyle={{
                alignItems: "center",
                marginTop: 24,
              }}
            >
              {cards.map((card, index) => (
                <DeckCard key={index} imageUrl={card.image} />
              ))}
            </ScrollView>

          </View>



        </>
      )}
    </View>
  );
}
