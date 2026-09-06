<script setup lang="ts">
import type { UploaderFileListItem } from 'vant';
import { showToast } from 'vant';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { changePassword, updateUserInfo, uploadImage } from '@/api';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'ProfileSettingsPage' });

const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);
const passwordSaving = ref(false);
const passwordEditorVisible = ref(false);
const form = reactive({ nickname: userStore.userInfo.nickname, avatar: userStore.userInfo.avatar, password: '', confirmPassword: '' });
const avatarPlatform = ref(userStore.userInfo.avatarPlatform ?? 'local-1');
const avatarFiles = ref<UploaderFileListItem[]>(form.avatar ? [{ url: form.avatar, isImage: true }] : []);

function openPasswordEditor() {
  form.password = '';
  form.confirmPassword = '';
  passwordEditorVisible.value = true;
}

function getUploaderFile(file: UploaderFileListItem | UploaderFileListItem[]) {
  return Array.isArray(file) ? file[0] : file;
}

async function uploadAvatar(file: UploaderFileListItem | UploaderFileListItem[]) {
  const uploadedFile = getUploaderFile(file);

  if (!uploadedFile?.file) {
    showToast('图片读取失败，请重新选择');
    return;
  }

  uploadedFile.status = 'uploading';
  uploadedFile.message = '上传中...';
  const data = new FormData();
  data.append('file', uploadedFile.file);

  try {
    const { data: avatar } = await uploadImage(data);
    form.avatar = avatar;
    avatarFiles.value = [{ url: avatar, isImage: true }];
  }
  catch {
    uploadedFile.status = 'failed';
    uploadedFile.message = '上传失败';
  }
}

function handleAvatarOversize() {
  showToast('头像仅支持 JPG、JPEG、PNG、WebP 格式，且不能超过 10MB');
}

async function saveInfo() {
  saving.value = true;
  try {
    await updateUserInfo({
      nickname: form.nickname || undefined,
      avatar: form.avatar || undefined,
      avatarPlatform: form.avatar ? avatarPlatform.value : undefined,
    });
    userStore.userInfo = {
      ...userStore.userInfo,
      nickname: form.nickname,
      avatar: form.avatar,
      avatarPlatform: form.avatar ? avatarPlatform.value : userStore.userInfo.avatarPlatform,
    };
  }
  finally {
    saving.value = false;
  }
}

async function savePassword() {
  if (form.password !== form.confirmPassword) {
    showToast('两次输入的密码不一致');
    return;
  }

  passwordSaving.value = true;
  try {
    await changePassword({ phone: userStore.userInfo.phone, password: form.password });
    passwordEditorVisible.value = false;
    userStore.handleLogout();
    await router.replace('/login');
  }
  finally {
    passwordSaving.value = false;
  }
}
</script>

<template>
  <div class="settings-page">
    <van-form @submit="saveInfo">
      <van-cell-group inset title="个人资料">
        <van-field v-model.trim="form.nickname" label="昵称" maxlength="20" placeholder="请输入昵称" :rules="[{ pattern: /^$|^.{2,20}$/, message: '昵称长度为 2-20 位' }]" />
        <van-field name="avatar" label="头像">
          <template #input>
            <van-uploader
              v-model="avatarFiles"
              accept="image/jpeg,image/png,image/webp"
              :max-count="1"
              :max-size="10 * 1024 * 1024"
              reupload
              :after-read="uploadAvatar"
              @oversize="handleAvatarOversize"
            />
          </template>
        </van-field>
        <van-cell title="手机号" :value="userStore.userInfo.phone" />
      </van-cell-group>
      <div class="actions actions--primary">
        <van-button round block type="primary" native-type="submit" :loading="saving">
          保存资料
        </van-button>
      </div>
    </van-form>

    <van-cell-group inset title="账户安全">
      <van-cell title="修改密码" is-link @click="openPasswordEditor" />
    </van-cell-group>

    <van-popup v-model:show="passwordEditorVisible" position="bottom" round closeable :style="{ maxHeight: '88%' }">
      <div class="settings-sheet">
        <div class="settings-sheet__header">
          <h2>修改登录密码</h2>
          <p>修改成功后需要重新登录</p>
        </div>
        <van-form @submit="savePassword">
          <van-cell-group inset>
            <van-field v-model="form.password" name="password" type="password" label="新密码" placeholder="请输入 6-20 位新密码" :rules="[{ required: true, pattern: /^.{6,20}$/, message: '密码长度为 6-20 位' }]" />
            <van-field v-model="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" placeholder="请再次输入新密码" :rules="[{ required: true, message: '请再次输入新密码' }]" />
          </van-cell-group>
          <div class="settings-sheet__action">
            <van-button round block type="primary" native-type="submit" :loading="passwordSaving">
              确认修改
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.actions {
  margin: 16px;

  &--primary {
    margin-bottom: 28px;
  }
}

.settings-sheet {
  padding: 26px 0 calc(22px + env(safe-area-inset-bottom));

  &__header {
    padding: 0 48px 18px 20px;

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: #323233;
      font-size: 19px;
      line-height: 27px;
    }

    p {
      margin-top: 5px;
      color: #969799;
      font-size: 13px;
      line-height: 18px;
    }
  }

  &__action {
    margin: 20px 16px 0;
  }
}
</style>
