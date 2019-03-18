/**
 * @flow
 * Created by Rabbit on 2019-02-25.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { WaterfallList } from 'react-native-largelist-v3';
import { NormalFooter } from 'react-native-spring-scrollview/NormalFooter';

import { WelfareMobx } from '../../../mobx/News';
import { inject, observer } from 'mobx-react';
import type { RTWeal } from '../../../servers/News/interfaces';
import { Button, CustomImage } from '../../../components';
import { System } from '../../../utils';
import { ActionSheet, Overlay } from 'teaset';
import type { NavigationState } from 'react-navigation';
import { PowerStore } from '../../../store/PowerStore';
import { ConfigStore } from '../../../store/ConfigStore';
import { PublicStore } from '../../../store/PublicStore';

type Props = {
  navigate: NavigationState,
  powerStore: PowerStore,
  configStore: ConfigStore,
  publicStore: PublicStore
};
@inject('publicStore')
@observer
class Welfare extends React.Component<Props> {
  welfareMobx: WelfareMobx;
  customPopView: any;

  constructor(props: any) {
    super(props);
    this.welfareMobx = new WelfareMobx();
  }

  componentDidMount = async () => {
    await this.welfareMobx.loadWelfareData('refreshing');
  };

  actionSheetToSaveImage = (item: RTWeal) => {
    const { saveImageWithIOS, saveImageWithAndroid } = this.props.publicStore;
    const items = [
      {
        title: '保存图片',
        onPress: () => (System.iOS ? saveImageWithIOS(item.largeUrl) : saveImageWithAndroid(item.largeUrl))
      },
      {
        title: '设置主屏幕',
        type: 'default',
        onPress: async () => {
          this.props.configStore.showToast('设置成功');
          await this.props.powerStore.setShiTuBackgroundImage(item.url);
        }
      }
    ];
    const cancelItem = { title: '取消' };
    ActionSheet.show(items, cancelItem);
  };

  showPopCustom(item: RTWeal) {
    const overlayView = (
      <Overlay.PopView
        style={{ alignItems: 'center', justifyContent: 'center' }}
        overlayOpacity={1}
        type="zoomOut"
        ref={v => (this.customPopView = v)}
      >
        <Button
          onLongPress={() => this.actionSheetToSaveImage(item)}
          onPress={() => this.customPopView && this.customPopView.close()}
        >
          <CustomImage
            source={{ uri: item.largeUrl }}
            resizeMode="cover"
            style={{
              backgroundColor: 'white',
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT
            }}
          />
        </Button>
      </Overlay.PopView>
    );
    Overlay.show(overlayView);
  }

  renderItem = (item: RTWeal) => {
    return (
      <Button onPress={() => this.showPopCustom(item)} style={{ flex: 1 }}>
        <CustomImage source={{ uri: item.url }} style={[styles.cell]} />
      </Button>
    );
  };

  render() {
    const { dataSource, isRefreshing, loadWelfareData } = this.welfareMobx;
    return (
      <WaterfallList
        ref={ref => (this._scrollView = ref)}
        data={dataSource}
        style={styles.container}
        heightForItem={item => item.height + 10}
        preferColumnWidth={SCREEN_WIDTH / 2 - 10}
        renderItem={this.renderItem}
        onRefresh={() => {
          loadWelfareData('refreshing');
          !isRefreshing && this._scrollView.endRefresh(); // 报错
        }}
        onLoading={async () => {
          loadWelfareData('load more');
          this._scrollView.endLoading();
        }}
        // loadingFooter={NormalFooter}
      />
    );
  }
}

export { Welfare };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 3
  },
  cell: {
    flex: 1,
    margin: 3,
    backgroundColor: 'white'
  }
});
