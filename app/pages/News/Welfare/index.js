/**
 * @flow
 * Created by Rabbit on 2019-02-25.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { WaterfallList } from 'react-native-largelist-v3';
import { NormalFooter } from 'react-native-spring-scrollview/NormalFooter';

import { WelfareMobx } from '../../../mobx/News';
// import { observer, inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';

import type { RTWeal } from '../../../servers/News/interfaces';
import { Button, CustomImage } from '../../../components';
import { System } from '../../../utils';
import { ActionSheet, Overlay } from 'teaset';
import type { NavigationState } from 'react-navigation';
import { PublicStore } from '../../../store/PublicStore';
import { ShiTuStore } from '../../../store/ShiTu/ShiTuStore';

const welfareMobx = new WelfareMobx();

type Props = {
  navigate: NavigationState,
  publicStore: PublicStore,
  shiTuStore: ShiTuStore
};

const Welfare = observer(function(props: Props) {
  const { dataSource, isRefreshing, loadWelfareData } = welfareMobx;
  const waterfallRef: WaterfallList = useRef();
  const customOverlayRef: Overlay = useRef();
  const { publicStore, shiTuStore } = props;

  useEffect(() => {
    loadWelfareData('refreshing');
  }, []);

  function actionSheetToSaveImage(item: RTWeal) {
    const { saveImageWithIOS, saveImageWithAndroid } = publicStore;
    const items = [
      {
        title: '保存图片',
        onPress: () => (System.iOS ? saveImageWithIOS(item.largeUrl) : saveImageWithAndroid(item.largeUrl))
      },
      {
        title: '设置主屏幕',
        type: 'default',
        onPress: async () => {
          welfareMobx.showToast('设置成功');
          await shiTuStore.setBackgroundImageUrl(item.url);
        }
      }
    ];
    const cancelItem = { title: '取消' };
    ActionSheet.show(items, cancelItem);
  }

  function showPopCustom(item: RTWeal) {
    const overlayView = (
      <Overlay.PopView
        // style={{ alignItems: 'center', justifyContent: 'center' }}
        overlayOpacity={1}
        type="zoomOut"
        ref={customOverlayRef}
      >
        <Button
          onLongPress={() => actionSheetToSaveImage(item)}
          onPress={() => customOverlayRef && customOverlayRef.current.close()}
        >
          <CustomImage
            source={{ uri: item.largeUrl }}
            resizeMode="contain"
            style={{
              // backgroundColor: 'white',
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT
            }}
            PlaceholderContent={<ActivityIndicator />}
            placeholderStyle={{ backgroundColor: 'black' }}
          />
        </Button>
      </Overlay.PopView>
    );
    Overlay.show(overlayView);
  }

  function renderItem(item: RTWeal) {
    return (
      <Button onPress={() => showPopCustom(item)} style={{ flex: 1 }}>
        <CustomImage
          source={{ uri: item.url }}
          containerStyle={[styles.cell]}
          style={{ flex: 1 }}
          placeholderStyle={{ backgroundColor: 'white' }}
          PlaceholderContent={<ActivityIndicator />}
        />
      </Button>
    );
  }

  return (
    <WaterfallList
      ref={waterfallRef}
      data={dataSource}
      style={styles.container}
      heightForItem={item => item.height + 10}
      preferColumnWidth={SCREEN_WIDTH / 2 - 10}
      renderItem={renderItem}
      onRefresh={() => {
        loadWelfareData('refreshing');
        !isRefreshing && waterfallRef.current.endRefresh(); // 报错
      }}
      onLoading={async () => {
        loadWelfareData('load more');
        waterfallRef && waterfallRef.current.endLoading();
      }}
      // loadingFooter={NormalFooter}
    />
  );
});

export { Welfare };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 3
  },
  cell: {
    flex: 1,
    margin: 3
    // backgroundColor: 'white',
    // height: 100,
    // width: 100,
    // width: SCREEN_WIDTH / 2 - 5,
    // height: 300
  }
});
