import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { IconX, IconShare, IconPlus } from '@tabler/icons-react-native';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const IOSInstallInstructions = ({ visible, onDismiss }: Props) => {
  const { t } = useLanguage();
  return (
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
            {t.iosInstall.title}
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
                {t.iosInstall.step1}
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {t.iosInstall.step1Sub}
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
                  {t.iosInstall.step2}
                </Text>
                <IconShare size={16} color="#4F46E5" />
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {t.iosInstall.step2Sub}
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
                  {t.iosInstall.step3}
                </Text>
                <IconPlus size={16} color="#4F46E5" />
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {t.iosInstall.step3Sub}
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
                {t.iosInstall.step4}
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {t.iosInstall.step4Sub}
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
            {t.iosInstall.understood}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  </Modal>
  );
};
