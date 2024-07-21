
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, Alert, ActivityIndicator} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, list } from "firebase/storage";



const ImagePickerExample = () => {
  const [imageUri, setImageUri] = useState("https://previews.123rf.com/images/mironovak/mironovak1508/mironovak150800047/44239635-textura-de-tela-branca-ou-textura-de-padr%C3%A3o-de-grade-de-linho.jpg");
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState([null]);
  const [visible, setVisible] = useState(false);

  const firebaseConfig = {
  apiKey: "AIzaSyArER7sdQQxfZUDOP1HDhY668Njrddx434",
  authDomain: "listaimagens.firebaseapp.com",
  projectId: "listaimagens",
  storageBucket: "listaimagens.appspot.com",
  messagingSenderId: "772259028029",
  appId: "1:772259028029:web:59db6a9b8e17fd218e9e54"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);



  //Armazena a imagem para o upload e exibe a imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      console.log(result.assets);
    }
  };

  function getRandom(max) {
    return Math.floor(Math.random() * max + 1);
  }

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Selecione uma imagem antes de enviar.');
      return;
    }

    // Create a root reference
    const storage = getStorage();

    const name = getRandom(200);
    const mountainsRef = ref(storage, name + '.jpg');

    const response = await fetch(imageUri);
    const blob = await response.blob();

    setUploading(true);
    uploadBytes(mountainsRef, blob).then((snapshot) => {
      console.log(snapshot);
      Alert.alert('Imagem enviada com sucesso!!');
      setUploading(false);
      setImageUri(null); // Limpar a imagem selecionada
    }).catch((error) => {
      console.error('Erro ao fazer upload:', error);
      setUploading(false);
    });
  };

  async function LinkImage() {
    const storage = getStorage();
    const listRef = ref(storage);

    const firstPage = await list(listRef, { maxResults: 100 });
    const lista = firstPage.items.map((item) => {
      return `https://firebasestorage.googleapis.com/v0/b/${item.bucket}/o/${encodeURIComponent(item.fullPath)}?alt=media`;
    });

    setImage(lista);
    setVisible(true);
    console.log(lista);
  }

  async function deleteImage(imagePath) {
    try {
      if (!imagePath.includes('/o/') || !imagePath.includes('?')) {
        throw new Error('URL da imagem malformada');
      }

      const pathSegments = imagePath.split('/o/');
      if (pathSegments.length < 2) {
        throw new Error('URL da imagem malformada');
      }

      const decodedPath = decodeURIComponent(pathSegments[1].split('?')[0]);
      const storage = getStorage();
      const listaRef = ref(storage, decodedPath);

      deleteObject(listaRef).then(() => {
        console.log('File deleted successfully');
        // Atualizar a lista de imagens
        setImage(image.filter(img => img !== imagePath));
      }).catch((error) => {
        console.error('Uh-oh, an error occurred!', error);
      });
    } catch (error) {
      console.error('Erro ao processar a URL da imagem:', error);
    }
  }


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Escolher Imagem" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 20 }} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View> <Button title="Enviar Imagem" onPress={uploadImage} disabled={!imageUri} /></View>

      )}
      <View><Button title="Ver Imagens" onPress={LinkImage} /></View>
      <FlatList
        data={image}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20, alignItems: 'center' }}>
            {item && (
              <>
                <Image source={{ uri: item }} style={{ width: 50, height: 50 }} />
                <Button title="Deletar Imagem" onPress={() => deleteImage(item)} />
              </>
            )}
          </View>
        )}

      />

    </View>
  );
};



export default ImagePickerExample;
