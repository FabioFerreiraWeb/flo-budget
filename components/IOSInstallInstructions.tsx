import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { IconX, IconShare, IconPlus } from '@tabler/icons-react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const IOSInstallInstructions = ({ visible, onDismiss }: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onDismiss}
  >
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      justifyContent: 'flex-end',
    }}>
      <View style={{
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
      }}>
        {/* Handle */}
        <View style={{
          width: 36, height: 4,
          backgroundColor: '#E2E8F0',
          borderRadius: 99,
          alignSelf: 'center',
          marginBottom: 16,
        }} />

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#1E293B' }}>
            Installer Flo sur iPhone
          </Text>
          <TouchableOpacity onPress={onDismiss}>
            <IconX size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Étapes */}
        <View style={{ gap: 14 }}>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 99,
              backgroundColor: '#EEF2FF',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F46E5' }}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1E293B' }}>
                Ouvre cette page dans Safari
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                L'installation ne fonctionne qu'avec Safari sur iPhone
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 99,
              backgroundColor: '#EEF2FF',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F46E5' }}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#1E293B' }}>
                  Tape l'icône Partager
                </Text>
                <IconShare size={16} color="#4F46E5" />
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                En bas de Safari, au centre de la barre d'outils
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 99,
              backgroundColor: '#EEF2FF',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F46E5' }}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#1E293B' }}>
                  "Sur l'écran d'accueil"
                </Text>
                <IconPlus size={16} color="#4F46E5" />
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Fais défiler le menu et appuie sur cette option
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 99,
              backgroundColor: '#EEF2FF',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F46E5' }}>4</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1E293B' }}>
                Appuie sur "Ajouter"
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Flo apparaîtra sur ton écran d'accueil comme une vraie app
              </Text>
            </View>
          </View>

        </View>

        {/* Bouton fermer */}
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            backgroundColor: '#4F46E5',
            borderRadius: 99,
            padding: 12,
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            J'ai compris
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  </Modal>
);
