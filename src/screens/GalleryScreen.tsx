import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import colors from "../theme/colors";
import { Screen, Card } from "../components/Layout";
import { Button, Input } from "../components/Fields";
import { useApp } from "../context/AppContext";

export default function GalleryScreen() {
  const {
    posts,
    user,
    addPost,
    deletePost,
    addComment,
    deleteComment,
    reportComment,
  } = useApp();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  }

  async function submit() {
    if (!caption.trim() && !image) {
      Alert.alert("Post vazio", "Adicione foto ou legenda.");
      return;
    }

    try {
      setPublishing(true);
      await addPost(caption, image);
      setCaption("");
      setImage(undefined);
    } finally {
      setPublishing(false);
    }
  }

  function options(postId: string, commentId: string) {
    Alert.alert("Comentário", "O que deseja fazer?", [
      {
        text: "Apagar comentário",
        onPress: () => deleteComment(postId, commentId),
      },
      {
        text: "Denunciar: indesejado",
        onPress: () => reportComment(postId, commentId, "Comentário indesejado"),
      },
      {
        text: "Denunciar: spam",
        onPress: () => reportComment(postId, commentId, "Spam"),
      },
      {
        text: "Denunciar: assédio",
        onPress: () => reportComment(postId, commentId, "Assédio"),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  }

  async function submitComment(postId: string) {
    const text = comments[postId]?.trim();

    if (!text) {
      Alert.alert("Comentário vazio", "Digite um comentário.");
      return;
    }

    try {
      setCommentingPostId(postId);
      await addComment(postId, text);
      setComments((prev) => ({ ...prev, [postId]: "" }));
    } finally {
      setCommentingPostId(null);
    }
  }

  return (
    <Screen title="Galeria da Comunidade">
      <Card>
        <Input label="Legenda" value={caption} onChangeText={setCaption} />

        {image ? (
          <Image
            source={{ uri: image }}
            style={{ height: 180, borderRadius: 18, marginBottom: 12 }}
          />
        ) : null}

        <Button title="Selecionar foto" variant="secondary" onPress={pick} />

        <Button
          title={publishing ? "Publicando..." : "Publicar"}
          onPress={submit}
        />
      </Card>

      {posts.length === 0 ? (
        <Card>
          <Text style={{ color: colors.muted }}>
            Nenhuma publicação ainda. Seja o primeiro a postar.
          </Text>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <Text style={{ fontWeight: "900", fontSize: 17 }}>
              {post.author}
            </Text>

            {post.caption ? (
              <Text style={{ color: colors.muted, marginVertical: 8 }}>
                {post.caption}
              </Text>
            ) : null}

            {post.image ? (
              <Image
                source={{ uri: post.image }}
                style={{ height: 220, borderRadius: 22, marginBottom: 10 }}
              />
            ) : (
              <View
                style={{
                  height: 140,
                  borderRadius: 22,
                  backgroundColor: colors.softBlue,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "900" }}>
                  Post da comunidade
                </Text>
              </View>
            )}

            {post.userId === user?.id ? (
              <Button
                title="Apagar publicação"
                variant="danger"
                onPress={() => deletePost(post.id)}
              />
            ) : null}

            <Text style={{ fontWeight: "900", marginTop: 14 }}>
              Comentários
            </Text>

            {post.comments.length === 0 ? (
              <Text style={{ color: colors.muted, marginTop: 8 }}>
                Nenhum comentário ainda.
              </Text>
            ) : (
              post.comments.map((comment) => (
                <Pressable
                  key={comment.id}
                  onLongPress={() => options(post.id, comment.id)}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text>
                    <Text style={{ fontWeight: "900" }}>
                      {comment.author}:{" "}
                    </Text>
                    {comment.text}
                  </Text>

                  <Text style={{ color: colors.muted, fontSize: 11 }}>
                    Segure para apagar ou denunciar
                  </Text>
                </Pressable>
              ))
            )}

            <TextInput
              placeholder="Comentar..."
              style={{
                backgroundColor: colors.background,
                borderRadius: 14,
                padding: 12,
                marginTop: 12,
              }}
              value={comments[post.id] || ""}
              onChangeText={(value) =>
                setComments((prev) => ({ ...prev, [post.id]: value }))
              }
            />

            <Button
              title={
                commentingPostId === post.id
                  ? "Enviando..."
                  : "Enviar comentário"
              }
              onPress={() => submitComment(post.id)}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}
