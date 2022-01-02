import { useRef } from 'react';
import { Text, Group } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';

type UploadProps = {
  accept?: string[];
  isLoading?: boolean;
  onDrop: (file: File[]) => Promise<void>;
};

export function FileUpload({ accept, onDrop, isLoading = false }: UploadProps) {
  const openRef = useRef(null);
  return (
    <>
      <Dropzone
        accept={accept}
        ref={openRef}
        multiple={false}
        onDrop={onDrop}
        loading={isLoading}
      >
        {status => {
          return (
            <Group
              position="center"
              spacing="xl"
              style={{ minHeight: 220, pointerEvents: 'none' }}
            >
              <div>
                <Text size="xl" inline>
                  Drag files here or click to select files
                </Text>
              </div>
            </Group>
          );
        }}
      </Dropzone>
    </>
  );
}
