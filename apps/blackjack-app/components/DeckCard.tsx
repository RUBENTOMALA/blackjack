
import { Image, View } from "react-native";

export function DeckCard({ imageUrl }: { imageUrl: string }) {
  return (
    <View style={{ marginHorizontal: 8 }}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: 100,
          height: 140,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ccc",
        }}
        resizeMode="contain"
      />
    </View>
  );
}
